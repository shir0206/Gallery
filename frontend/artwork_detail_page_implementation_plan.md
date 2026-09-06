# Artwork Detail Page — Implementation Plan

## 1. Objective

Rebuild the existing artwork feature spread so it matches the supplied reference: a warm, museum-like detail page that presents the artwork first and introduces acquisition quietly. The page should use the current `Artwork` data and `PurchaseFlow`, remain layered above the gallery/grid, and work for both landscape and portrait pieces.

The screenshot is the visual source of truth for composition and hierarchy. The attached specification supplies behavioral and content requirements where the screenshot cannot show them, especially responsive rules, orientation handling, motion, and availability states.

## 2. What changes from the current implementation

The existing page is a three-screen scrollytelling experience:

1. centered title and artwork;
2. separate crop-and-copy section;
3. full-width room image with floating controls and a second commerce panel.

The target is a tighter two-part editorial page:

1. a compact top composition with a left information rail and a dominant artwork collage;
2. a contiguous room image and acquisition panel, followed by one restrained trust strip.

The implementation should therefore replace the current section boundaries rather than trying to restyle them in place. Existing commerce utilities, purchase-state behavior, room assets, saved-work behavior, and purchase modal entry point can be retained.

## 3. Target page anatomy

```text
Desktop
┌──────────────────────────────────────────────────────────────┐
│ Global header: brand · nav · search · saved · bag            │
├──────────────┬───────────────────────────────────────────────┤
│ ← Gallery    │                                               │
│              │         full uncropped artwork                │
│ Title        │                                               │
│ Description  ├──────────┬──────────┬──────────┬──────────────┤
│ Technical    │  crop 1  │  crop 2  │  crop 3  │   crop 4     │
│ Metadata     │                                               │
├────────────────────────────────┬─────────────────────────────┤
│                                │ Bring this artwork          │
│ room visualization with        │ into your home.             │
│ artwork shown on wall          │ old price · SALE            │
│                                │ new price                    │
│                                │ [ Add to collection → ]      │
├──────────────────────────────────────────────────────────────┤
│ Signed original | Certificate | Worldwide shipping | One/one │
└──────────────────────────────────────────────────────────────┘
```

For portrait artwork, the information rail remains on the left while the visual area becomes a three-column collage: supporting crops flank the complete portrait image. The primary image must never use `object-fit: cover`.

## 4. Component plan

### 4.1 `ArtworkPage`

Refactor `src/pages/ArtworkPage/ArtworkPage.tsx` into the page shell and orchestration layer.

- Keep the fixed overlay so the gallery or grid remains mounted underneath.
- Replace the fixed mini chrome bar with the complete editorial header.
- Keep `onBack`, `onPrevious`, `onNext`, `onStartPurchase`, and `isCovered`.
- Give the scroll container a ref and reset it to the top when `artwork.id` changes.
- Key the inner page content by `artwork.id` so opening another work replays the restrained entrance sequence.
- Lock focus inside the purchase flow as currently handled there; mark the page inert/hidden while covered.
- Add Escape-to-gallery behavior only when the purchase flow is not open and a back callback exists.

Suggested composition:

```tsx
<ArtworkPageShell>
  <EditorialHeader />
  <main key={artwork.id}>
    <ArtworkOverview artwork={artwork} />
    <AcquisitionSection artwork={artwork} />
    <ConfidenceStrip artwork={artwork} />
  </main>
  <ArtworkNavigation />
</ArtworkPageShell>
```

### 4.2 `EditorialHeader` (new)

Add `src/pages/ArtworkPage/components/EditorialHeader.tsx` and CSS.

- Desktop: `SZ / SHIR ZABOLOTNY ARTWORKS`, centered navigation, and search/saved/bag controls.
- Mobile: compact `SZ`, search, saved, and bag controls; hide the centered navigation.
- Make only currently supported actions interactive. Unsupported navigation labels should be visually present but not fake links; alternatively, expose callbacks as optional props before making them buttons.
- Reuse the local-storage favorite count initially. Do not imply a working cart count unless the app has collection state to support it.
- Use inline SVG line icons so weight and color remain consistent.
- Sticky within the artwork scroller, with a warm translucent background and subtle bottom rule.

### 4.3 `ArtworkOverview` (replace `HeroSection` + `CollageSection`)

Create `src/pages/ArtworkPage/sections/ArtworkOverview.tsx` and orientation-specific CSS.

Information rail:

- back-to-gallery link;
- large serif title;
- one concise emotional description (`description.inspiration` for now);
- a short rule;
- technical line generated from medium, dimensions, and year;
- five metadata rows: year, dimensions, medium, original, signed.

Visual collage:

- Landscape: complete image across the top and four equal-height crops below.
- Portrait: complete portrait in the dominant center column, with two stacked crop columns around it.
- Square: treat as portrait-style editorial composition but give the full image a wider center column.
- Render `detailImages` when supplied; otherwise generate crops from `imageUrl` using configurable `object-position` fallbacks.
- Use real `<img>` elements rather than CSS backgrounds so alternate text, loading, decoding, and responsive image behavior remain available.
- The main image uses `width: 100%; height: auto; object-fit: contain` and preserves its natural aspect ratio.
- Crop images use `object-fit: cover`, `overflow: hidden`, and a subtle desktop hover scale.
- The crop row should not be a carousel and should have no captions or dots.

### 4.4 `AcquisitionSection` (replace current `DetailsSection` presentation)

Refactor `src/pages/ArtworkPage/sections/DetailsSection.tsx` or replace it with `AcquisitionSection.tsx`.

- Desktop grid: room visualization at roughly 68%, acquisition panel at roughly 32%.
- Remove the floating price plaque, floating favorite button, and floating pill CTA from the room image.
- Keep room selection by palette and the artwork-on-wall composite logic.
- Make the room and panel visually contiguous: no rounded card shells, heavy shadows, or gap between them.
- Add the reference copy block on the room image (`A piece of a quieter world.`), but keep it decorative and non-essential.
- Add an optional scale disclaimer below or over the room image: “Shown in a residential setting for scale and inspiration.”

Acquisition panel:

- heading: “Bring this artwork into your home.”;
- short horizontal rule;
- struck-through list price when a valid sale exists;
- small muted-gold `SALE` label;
- large effective price;
- dark rectangular `Add to collection` CTA with arrow;
- `Reserved` or `Private collection` status in place of an active CTA;
- omit the entire price/action area when commerce is hidden.

Clicking the CTA continues to call `onStartPurchase(artwork.id)` so the existing `PurchaseFlow` remains the transaction boundary.

### 4.5 `ConfidenceStrip`

Restyle the existing component rather than replacing its logic.

- Four items in one desktop row below the complete room/acquisition grid.
- No surrounding card, background fill, rounded corners, or shadow.
- Thin top/bottom rules and vertical separators.
- Match the reference order and wording: Signed original, Certificate of authenticity, Worldwide shipping, One of one.
- Use the existing line SVGs, adjusting only labels and icon mapping.
- Mobile becomes a vertical list; tablet may use 2 × 2.

### 4.6 Artwork navigation

- Move previous/next controls out of the prominent top-right circular buttons.
- Use an understated text treatment near the end of the page: `‹ PREV | NEXT ›`.
- On selection, scroll the page scroller to `0`, then change the artwork or immediately swap and replay the content transition.
- Preserve wraparound behavior from `getAdjacentId`.

## 5. Data model changes

Extend `src/types/artwork.ts` without breaking current mock or Firebase records:

```ts
export type ArtworkOrientation = 'landscape' | 'portrait' | 'square';

export interface ArtworkCrop {
  id: string;
  imageUrl?: string;
  alt?: string;
  objectPosition: string; // e.g. "18% 38%"
  zoom?: number;
}

export interface Artwork {
  // existing fields remain
  technicalLine?: string;
  original?: boolean;
  detailCrops?: ArtworkCrop[];
  image?: {
    width: number;
    height: number;
  };
}
```

Implementation rules:

- Derive orientation from source dimensions when present; fall back to the current `orientation` field.
- Keep new fields optional while Firestore data is migrated.
- Generate the technical line from existing fields unless explicitly authored.
- Read `commerce.signed` and `commerce.certificateIncluded`; do not duplicate these as hardcoded display claims.
- Treat “Original / One of one” as commerce/content data, not a universal assertion.
- Update `mapArtworkDoc.ts` defensively so old documents remain valid.
- Add authored focal positions to mock data for visual QA. Generic fallback positions are acceptable only until each artwork is art-directed.

## 6. Styling system

Update the editorial tokens in `src/styles/global.css` to the reference palette:

```css
--paper: #f4f0e9;
--paper-soft: #f8f5ef;
--paper-deep: #eae3d8;
--ink: #181512;
--ink-soft: #504b45;
--muted: #8b847b;
--line: rgb(24 21 18 / 14%);
--gold: #b8944f;
--button: #1c1916;
```

Keep aliases for existing `--editorial-*` variables during the refactor to avoid changing unrelated screens in one pass.

Typography:

- Use the existing Fraunces/Inter stack initially.
- Confirm the fonts are actually loaded; current CSS only names them.
- If adding hosted font files is acceptable, use an editorial display serif with a high-contrast character closer to the reference and self-host it to avoid render-time network dependency.
- Use serif for titles, descriptions, prices, and the acquisition headline; sans for navigation, labels, and controls.

Layout values:

- page max width: approximately `1440px`;
- header height: `72px` desktop, `64px` mobile;
- overview grid: `minmax(220px, 25%) 1fr`;
- acquisition grid: `minmax(0, 2fr) minmax(300px, 0.9fr)`;
- hairline borders, square corners, minimal shadow;
- fluid gaps and type via `clamp()` rather than viewport-specific pixel copies.

## 7. Responsive behavior

### Desktop (`>= 1024px`)

- Full navigation header.
- Information rail and artwork collage side by side.
- Landscape crop row under the artwork.
- Portrait crop columns around the artwork.
- Room/acquisition horizontal split.
- Four-item horizontal confidence strip.

### Tablet (`640px–1023px`)

- Keep the overview side by side while space permits, reducing the information rail.
- Collapse acquisition content under the room image at narrower tablet widths.
- Confidence strip uses 2 × 2.
- Hide non-essential header navigation before compressing typography too far.

### Mobile (`< 640px`)

Use the specific content order shown in the reference:

1. compact header;
2. full uncropped artwork;
3. horizontal four-crop strip;
4. title;
5. emotional description;
6. technical line;
7. metadata;
8. room image;
9. acquisition copy, pricing, and full-width CTA;
10. stacked confidence items;
11. previous/next navigation.

Do not preserve desktop grid order if it conflicts with this sequence. Use CSS grid areas or render a single semantic DOM order that can be rearranged safely without producing a confusing keyboard/screen-reader order.

## 8. Motion and interaction

The project currently has no animation dependency. Prefer CSS transitions and `IntersectionObserver` for this version rather than introducing Framer Motion solely for simple reveals.

- Page overlay: `translateY(100%)` to `0` over about `850ms` using `cubic-bezier(.22,1,.36,1)`.
- Background gallery: apply a slight scale/opacity change while covered.
- Page entrance: stagger header, primary art, title, copy, metadata, then crops.
- Artwork change: brief fade/vertical shift keyed by `artwork.id`.
- Scroll reveal: one observer-driven utility class for acquisition content and confidence items.
- Crop hover: scale to about `1.035` over `650ms`.
- CTA hover: arrow travels `4–6px` and an optional faint highlight passes through.
- Avoid heavy parallax in the first implementation; it adds complexity without materially improving the reference match.
- Under `prefers-reduced-motion: reduce`, remove transforms, delays, smooth scrolling, and staggered reveals while keeping all content visible.

An artwork zoom viewer should be a follow-up after the core layout is matched. If included in this scope, implement it as an accessible dialog with focus trapping, Escape close, a dark warm background, and touch-native pinch zoom rather than custom gesture math.

## 9. Accessibility and content behavior

- Use one page-level `h1` for the artwork title and an `h2` for the acquisition heading.
- Keep the decorative crops empty-alt; give authored detail images meaningful alt text only when they convey unique information.
- Use `<dl>` for metadata.
- Ensure icon-only buttons have labels and at least a 44 × 44 px hit area.
- Keep focus indicators visible against both paper and dark CTA backgrounds.
- When artwork changes, announce the new title and position through an `aria-live="polite"` region.
- Prevent interaction with the underlying gallery while the overlay is open using `inert` where supported in addition to `aria-hidden`.
- Disable background page scroll while retaining scroll inside the artwork overlay.
- Do not show signed, certificate, worldwide shipping, or one-of-one claims when the corresponding data is absent or false.

## 10. File-level worklist

| File | Planned change |
|---|---|
| `src/pages/ArtworkPage/ArtworkPage.tsx` | New shell, header, keyed content transition, scroll reset, navigation placement |
| `src/pages/ArtworkPage/ArtworkPage.css` | Overlay entrance, sticky header integration, page width and responsive shell |
| `src/pages/ArtworkPage/components/EditorialHeader.tsx` | New brand/navigation/utility header |
| `src/pages/ArtworkPage/components/EditorialHeader.css` | Desktop/mobile header layouts |
| `src/pages/ArtworkPage/sections/ArtworkOverview.tsx` | Information rail plus orientation-aware collage |
| `src/pages/ArtworkPage/sections/ArtworkOverview.css` | Landscape, portrait, square, and mobile compositions |
| `src/pages/ArtworkPage/sections/DetailsSection.tsx` | Convert to room/acquisition split; remove duplicate/floating commerce UI |
| `src/pages/ArtworkPage/sections/DetailsSection.css` | Match contiguous section, premium sale treatment, responsive stacking |
| `src/components/Commerce/ConfidenceStrip/*` | Reference wording/order and border-only presentation |
| `src/types/artwork.ts` | Optional source dimensions, square orientation, authored crops/technical line |
| `src/api/firebase/mapArtworkDoc.ts` | Normalize new optional fields and orientation fallback |
| `src/api/mock/mockArtworkData.ts` | Add art-directed crop positions and representative sale/state cases |
| `src/styles/global.css` | Warm reference tokens, verified font declarations, shared motion tokens |
| `src/pages/ArtworkPage/sections/HeroSection.*` | Remove after `ArtworkOverview` is wired |
| `src/pages/ArtworkPage/sections/CollageSection.*` | Remove after `ArtworkOverview` is wired |

`ArtworkCommercePanel` should no longer render below the room section because its information will live in the acquisition panel. Its commerce-state helpers remain reusable; remove the component only after confirming it has no other consumers.

## 11. Implementation sequence

1. **Normalize data and helpers**
   - Add optional crop/source-image fields and square orientation.
   - Add orientation and technical-line helper functions.
   - Preserve backward compatibility with existing Firebase records.

2. **Build the static desktop composition**
   - Add the header.
   - Replace hero/collage with `ArtworkOverview`.
   - Implement landscape first, then portrait and square variants.

3. **Rebuild acquisition presentation**
   - Convert the existing room section to the 68/32 split.
   - Reuse pricing/state helpers and `onStartPurchase`.
   - Remove duplicate and floating purchase surfaces.

4. **Restyle the trust strip**
   - Match order, labels, separators, and responsive layouts.

5. **Implement mobile as a distinct composition**
   - Confirm content order, image proportions, crop strip, header density, and full-width CTA.

6. **Add restrained motion**
   - Page entrance, keyed artwork changes, in-view reveals, CTA/crop hover, and reduced-motion behavior.

7. **Polish and verify**
   - Art-direct crop focal points per artwork.
   - Tune the wall placement for every room/orientation pairing.
   - Verify all commerce states and keyboard/focus behavior.

## 12. Verification checklist

Run:

```bash
yarn lint
yarn build
```

Visual QA at minimum:

- `1440 × 1024` desktop landscape artwork;
- `1440 × 1024` desktop portrait artwork;
- `1024 × 768` tablet;
- `390 × 844` mobile landscape artwork;
- `390 × 844` mobile portrait artwork;
- one available sale item;
- one available full-price item;
- one reserved item;
- one sold item;
- one item with no purchase data;
- reduced-motion mode;
- slow image loading and failed optional room image.

Acceptance criteria:

- The top of the page reads like the supplied reference at first glance.
- The primary artwork is always complete and uncropped.
- Portrait compositions have no artificial empty side bands.
- There is exactly one primary acquisition CTA.
- Sale styling is restrained and the CTA remains dark.
- The room image and acquisition panel form one continuous section.
- The four collector benefits form one row on desktop and a readable stack/grid on smaller screens.
- Previous/next updates content without a hard refresh and returns the artwork scroller to the top.
- Existing `PurchaseFlow` still opens for an available artwork.
- No unsupported feature is presented as functional.
- Layout, focus order, and claims remain correct for every commerce state.

## 13. Deliberate deferrals

These should not block the reference-aligned page:

- shared-element transition from gallery thumbnail to detail image;
- cursor-follow magnification;
- fullscreen pinch-zoom viewer;
- functional search, global favorites page, or shopping bag;
- GSAP or Framer Motion adoption;
- separate uploaded crop assets for every artwork.

They can be added after the static composition, responsive behavior, and commerce states pass visual QA.
