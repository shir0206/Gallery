# Mobile painting navigation / scrolling investigation

Date: 2026-09-15. Application behavior was not changed.

## Findings

- All 29 paintings scroll after Next and after Previous once their image intro has settled. Both wraparound boundaries pass. No painting-name, portrait/landscape, or direction pattern appeared in that run.
- A swipe started immediately after Next can be lost during the navigation/intro. Waiting and swiping again succeeds. This is a temporary interruption, not evidence of a permanent freeze.
- A controlled image-decoding stall reproduces a lasting scroll lock: `data-intro-locked` remains present, CSS `overflow-y` stays `hidden`, and touch gestures leave `scrollTop` at zero. After 6 seconds and another 3 seconds it is still locked. Releasing decoding on the same painting unlocks scrolling.
- This confirms an unbounded dependency on image readiness. It does **not** establish that image decoding actually stalls on the user's phone. Device/browser details and an on-device reproduction are still needed to connect this mechanism to the reported incident.

## Test method

Local development app at `http://127.0.0.1:5173/Gallery/`, desktop Chrome with mobile/touch emulation at 390×844 and 320×568. Gestures use Chrome's touch input API, not `scrollTop` assignment. Each observation records painting title, transition phase, intro lock, computed overflow, scroll range, scroll position, image readiness/natural width, and orientation.

The test browser's direct remote image requests produced unloaded images, including after relaxing certificate validation. The successful-image run therefore used the 29 actual public catalogue JPEGs fetched with curl into `/tmp/gallery-scroll-images`, fulfilled through browser request interception. This retains the paintings' actual pixels/dimensions but does not reproduce production networking or normal HTTP cache behavior. Repeated visits exercise already-used image resources, not a separately verified cold/warm HTTP cache comparison.

For the controlled stall only, the edge suite holds the overview image's `decode()` promise pending and later releases it. The application code is untouched. PASS/FAIL in JSON means the measured swipe increased scroll position; deliberately testing a locked intro can produce a FAIL even where that temporary lock is intended. These are diagnostic scripts, not CI assertions; process exit 0 means the script completed.

## Cases and results

| Case | Steps | Result |
|---|---|---|
| Wall entry | Open Butterflies, wait for intro, swipe up | PASS |
| Every Next edge | Next, wait 1 second, swipe; repeat 29 times | 29/29 PASS |
| Next wraparound | Onward → Next → Butterflies → swipe | PASS |
| Every Previous edge | Previous, wait 1 second, swipe; repeat 29 times | 29/29 PASS |
| Previous wraparound | Butterflies → Previous → Onward → swipe | PASS |
| Direction reversals | Next → swipe → Previous → swipe, twice | 4/4 PASS |
| Next from details | Open section 02, Next, wait, swipe | PASS |
| Previous from details | Open section 02, Previous, wait, swipe | PASS |
| Immediate swipe | Next, start swipe immediately | First gesture lost during transition; retry after waiting PASS |
| Rapid reversal, 100 ms | Right arrow, 100 ms, Left arrow, wait, swipe | Scroll PASS; reversal ignored by 525 ms navigation guard |
| Reversal after 550 ms | Right arrow, 550 ms, Left arrow, wait, swipe | Scroll PASS; returns to starting painting |
| Narrow portrait | 320×568, Next to Sunrise, wait, swipe | PASS in corrected edge run |
| Narrow landscape | 320×568, Previous to Wind, wait, swipe | PASS in corrected edge run |
| Reduced motion | Next and Previous with reduced motion enabled | Both scroll in corrected edge run |
| Next with decode pending | Hold decode, Next to Sunrise, wait 6 seconds, swipe | BLOCKED: lock true, overflow hidden, scrollTop 0 |
| Repeat while pending | Wait 3 more seconds, swipe again | Still BLOCKED |
| Decode recovery | Release decoding, wait, swipe same Sunrise | PASS; lock false, overflow auto |
| Previous with decode pending | Hold decode, Previous to Wind, wait 3 seconds, swipe | BLOCKED: lock true, overflow hidden, scrollTop unchanged at 1 |
| Previous decode recovery | Release decoding, wait, swipe same Wind | PASS; scrollTop 1 → 362 |
| Image-error fallback | Full Next/Previous cycle with images failing to load | All 63 baseline observations PASS |

## Code path explaining the lock

1. `GalleryPage.tsx` clears `transitionArtworkId` for both Next and Previous, so the new artwork no longer uses the shared wall image.
2. `ArtworkPage.tsx:45–74` locks the non-shared intro on each artwork change. Its 525 ms unlock timer starts only when `handleIntroReady` runs.
3. `ArtworkOverview.tsx:119–130` calls `onIntroReady` only after `image.decode()` resolves or rejects (or through the separate image-error handler).
4. `ArtworkPage.css:81–85` applies `overflow-y: hidden` while that intro lock exists.

There is no deadline if loading/decoding never settles. A slow image therefore extends the period during which gestures cannot scroll. A loading indicator or an image remaining visible elsewhere does not prove this particular decode promise has settled.

## Coverage limits and follow-up

- Tested Chrome mobile emulation, not physical iOS Safari or Android Chrome.
- Wall entry is covered; collection-grid, search, direct URL and cart entry have not been run through this touch matrix.
- Rapid reversal uses keyboard handlers sharing the same browse function; a physical double tap has not been separately tested.
- No natural persistent freeze occurred with successfully decoded images. Delayed decoding is an injected reproduction, not a confirmed production cause.
- Existing Node tests also pass: 5/5. They do not exercise real mobile gestures.

## Files and running

- `tests/mobile-scroll-investigation.cjs`: full 29-painting forward/reverse matrix.
- `tests/mobile-scroll-edge.cjs`: details, immediate gestures, rapid reversals, narrow viewport, reduced motion, and controlled decode stall/recovery.
- `artifacts/mobile-scroll-matrix-results.json`: 63 valid successful-image baseline observations extracted from the initial full run.
- `artifacts/mobile-scroll-edge-results.json`: corrected edge run, with touch coordinates scaled to the viewport.
- `artifacts/mobile-scroll-results.json`: original image-error baseline.
- `artifacts/mobile-scroll-fixture-results.json`: original full fixture run, including four invalid narrow/reduced-motion observations. Those gestures started below the small viewport; they are excluded from conclusions and were rerun correctly in the edge suite.
- `artifacts/mobile-scroll-loaded-results.json`: second remote-image attempt; despite its name, naturalWidth remained zero. Do not treat it as a successful-image test.

Run the local Vite server, then:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright IMAGE_FIXTURES=/tmp/gallery-scroll-images node tests/mobile-scroll-investigation.cjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright IMAGE_FIXTURES=/tmp/gallery-scroll-images node tests/mobile-scroll-edge.cjs
```

`PLAYWRIGHT_MODULE` defaults to `playwright`; `GALLERY_URL` overrides the local address. `IMAGE_FIXTURES` is optional and must contain the catalogue JPEGs under their original filenames. Chrome must be installed. Full-matrix output defaults to `artifacts/mobile-scroll-results.json`; set `RESULT_FILE` to preserve earlier runs. Edge output goes to `artifacts/mobile-scroll-edge-results.json`.
