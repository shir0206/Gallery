# Shir Zabolotny Art Gallery — E-commerce Extension Specification

## Status and intent

**Project:** existing React 18 + TypeScript + Vite gallery  
**Document type:** requirements and implementation contract for extending the current application  
**Primary experience:** museum/gallery storytelling first, commerce second  
**Product model:** every artwork is one fixed, original physical piece  
**Current transaction model:** optional external purchase URL  
**Target transaction model:** a calm reserve/purchase flow that can later move to a dedicated route

This specification describes an extension of the code that exists in this repository. It is not a greenfield architecture proposal. Existing component names, state ownership, data adapters, styling conventions, and navigation behavior are the baseline unless a requirement below explicitly changes them.

---

## 1. Product principles

The site must feel like a private gallery that permits purchasing, not a conventional retail catalogue.

- Art remains the dominant visual element.
- Commercial information appears only when it is real and useful.
- A work has no size, print, frame, finish, or quantity variants.
- Scarcity language must be factual: “Original”, “One of a kind”, “Reserved”, “Sold”, or “Private collection”.
- The living-room composition is the emotional conversion point.
- Checkout language must describe the actual business process. Do not call an immediate payment a booking, and do not promise a reservation period unless the backend enforces it.
- Missing commerce data must hide the commerce affordance; the UI must not invent prices, availability, links, delivery dates, or policy claims.

Avoid mass-market patterns such as quantity controls, variant selectors, carts for a single work, urgency timers, loud sale colors, large review widgets, and payment-logo clutter.

---

## 2. Current application baseline

### 2.1 Runtime composition

```txt
main.tsx
└── App
    └── ArtworkCollectionProvider
        └── GalleryPage
            ├── GalleryStatus                 loading / error / empty
            ├── Gallery                      immersive wall surface
            │   ├── GalleryBackground
            │   ├── ArtworkViewer
            │   │   ├── ArtworkDetails
            │   │   └── ArtworkPurchaseCta
            │   └── GalleryNavigation
            │       └── ArtworkThumbnail
            ├── HomePage                     collection grid surface
            └── ArtworkPage                  editorial overlay
                ├── HeroSection
                ├── CollageSection
                └── DetailsSection
```

`GalleryPage` is the application screen coordinator. It currently owns:

- wall versus collection-grid mode through `showWallView`;
- the open editorial artwork through `featureArtworkId`;
- previous/next artwork stepping for the editorial view;
- preservation of the wall/grid underneath the editorial overlay.

The application does not currently use a router. This is intentional and must remain so for the first commerce increment. Route support is a later migration gate, not a prerequisite for adding the first purchase flow.

### 2.2 Existing user journey

```txt
Gallery wall (default) ↔ Collection grid
          │                    │
          └────── open artwork ┘
                         ↓
              ArtworkPage overlay
        Hero → Collage/story → In-room view
                         ↓
              Current external purchase link
```

The extension must preserve wall scrolling, thumbnail selection, keyboard navigation, grid browsing, editorial stepping, and the mounted-underlay behavior of `ArtworkPage`.

### 2.3 Existing state and data flow

```txt
mock API or Firestore
        ↓
getArtworkCollection()
        ↓
ArtworkCollectionProvider
  (48-hour localStorage cache)
        ↓
GalleryPage and descendants
```

UI components must continue to consume domain objects rather than raw Firestore documents. Firebase-specific parsing stays in `src/api/firebase/mapArtworkDoc.ts`.

### 2.4 Styling baseline

The project uses colocated plain CSS files and shared CSS custom properties in `src/styles/global.css`. Continue that convention. Do not introduce CSS Modules, Tailwind, a UI framework, or a second token system as part of this extension.

The existing token families are authoritative:

- `--gallery-*` for the immersive wall;
- `--editorial-*` for the feature spread.

New commerce tokens should extend the editorial family or use a clearly prefixed `--commerce-*` family where the value is genuinely shared across commerce components.

---

## 3. Target experience

The target journey extends the current editorial page rather than replacing it:

```txt
Gallery wall or collection grid
              ↓
ArtworkPage overlay
  1. HeroSection — identity and full artwork
  2. CollageSection — story, material, crops, facts
  3. DetailsSection — realistic room composition
  4. CommerceSection — price, availability, trust, action
              ↓
PurchaseFlow overlay
  summary → details/payment handoff → confirmation
```

The room image should remain visually uncluttered. Commercial controls belong in a separate panel immediately after it, which matches the current `DetailsSection` direction.

The wall-level `ArtworkPurchaseCta` remains a concise shortcut. The editorial flow is the richer, preferred decision path.

---

## 4. Component extension plan

### 4.1 Keep these responsibilities

| Existing unit | Required responsibility |
| --- | --- |
| `App` | Provider composition only |
| `ArtworkCollectionProvider` | Collection loading, cache hydration, retry, and collection refresh |
| `GalleryPage` | Top-level surface and overlay coordination |
| `Gallery` | Wall selection, visibility, progress, and wall keyboard behavior |
| `ArtworkViewer` | Continuous wall rendering and scroll/selection synchronization |
| `HomePage` | Browsable collection grid |
| `ArtworkPage` | Single-work editorial scroller and fixed page chrome |
| `HeroSection` | Artist, title, and complete uncropped artwork |
| `CollageSection` | Story, material, curated details, and catalogue facts |
| `DetailsSection` | In-room visualization and entry into commerce |
| `artworkApi` | Source selection and UI-facing collection API |
| `mapArtworkDoc` | Runtime validation/adaptation of Firestore artwork records |

### 4.2 Add these product components

Add product-specific components only when their phase is implemented:

```txt
src/components/Commerce/
├── ArtworkCommercePanel/
│   ├── ArtworkCommercePanel.tsx
│   └── ArtworkCommercePanel.css
├── ConfidenceStrip/
│   ├── ConfidenceStrip.tsx
│   └── ConfidenceStrip.css
└── PurchaseFlow/
    ├── PurchaseFlow.tsx
    ├── PurchaseFlow.css
    ├── PurchaseSummary.tsx
    ├── CheckoutForm.tsx
    └── PurchaseConfirmation.tsx
```

Do not create generic `Button`, `Modal`, `Price`, or `Field` abstractions before at least two real consumers require the same behavior. Small shared formatting and policy helpers belong in `src/utils` or a focused commerce module.

### 4.3 Integration boundaries

- `DetailsSection` renders the in-room image and delegates the decision panel to `ArtworkCommercePanel`.
- `ArtworkCommercePanel` emits `onStartPurchase(artwork.id)`; it does not own app-level overlay state.
- `ArtworkPage` passes commerce events upward and remains presentational.
- `GalleryPage` owns `purchaseArtworkId` and the purchase-flow step because it already owns top-level overlays.
- `PurchaseFlow` receives one resolved `Artwork`, the current step, and explicit callbacks. It must not fetch the collection again.
- Opening `PurchaseFlow` covers `ArtworkPage`; both the page and wall underneath remain mounted.
- While covered, underlying surfaces must be removed from keyboard and assistive-technology interaction.

Recommended state for the first in-app flow:

```ts
type PurchaseFlowStep = 'summary' | 'checkout' | 'confirmation';

type PurchaseFlowState =
  | { status: 'closed' }
  | {
      status: 'open';
      artworkId: string;
      step: PurchaseFlowStep;
    };
```

Keep this local to `GalleryPage` until URL persistence or cross-route access is implemented.

---

## 5. Artwork domain model

### 5.1 Current fields that must remain compatible

```ts
interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  medium: string;
  dimensions: { width: number; height: number; unit: string };
  category: string[];
  status: string; // publishing/content status
  description: {
    materials: string;
    visual: string;
    inspiration: string;
  };
  imageUrl: string;
  orientation: 'portrait' | 'landscape';
  palette: { id: string; name: string };
  purchaseUrl?: string;
  price?: number;
  salePrice?: number;
  availability?: 'available' | 'reserved' | 'sold';
}
```

`status` and `availability` are different concepts. `status` controls whether a record is published. `availability` controls whether the physical work can be acquired. They must not be merged.

### 5.2 Required compatible additions

Extend the existing interface without renaming current fields or introducing a second artwork type:

```ts
interface ArtworkCommerce {
  currency?: 'USD' | 'EUR' | 'GBP';
  offerLabel?: string;
  signed?: boolean;
  certificateIncluded?: boolean;
  reservationDays?: number;
  shipping?: {
    worldwide: boolean;
    insured: boolean;
    estimatedBusinessDays?: { min: number; max: number };
  };
}

interface ArtworkDetailImage {
  id: string;
  imageUrl: string;
  alt: string;
  objectPosition?: string;
}

// Optional additions on Artwork:
// commerce?: ArtworkCommerce
// detailImages?: ArtworkDetailImage[]
// interiorImageUrl?: string
```

All additions are optional during migration. Existing mock and Firestore records must continue rendering.

### 5.3 Data invariants

- `price` and `salePrice` are integer minor-independent display amounts under the current project convention; do not silently reinterpret them as cents.
- `salePrice` is valid only when `price` exists and `salePrice < price`.
- `purchaseUrl` must be an allowed `https` URL before it is rendered.
- `sold` always disables acquisition, even if a purchase URL exists.
- `reserved` must not present an immediate-purchase action unless the backend explicitly supports a waitlist or takeover flow.
- Currency must not be hardcoded in JSX. The existing USD default may remain until records carry currency.
- Detail-image metadata should drive crops when present; the existing single-image CSS crops remain the fallback.
- Interior imagery should come from `interiorImageUrl` when present, then the existing palette-to-room mapping, then the generic placeholder.

### 5.4 Adapter requirement

The current Firestore mapper only returns required editorial fields. Before relying on commerce fields from Firestore, update `mapArtworkDoc` to parse and return every optional commerce field safely. Optional invalid fields should be omitted or cause the record to be skipped according to one documented policy; they must not pass through unchecked.

Mock records and Firestore records must have the same observable behavior.

---

## 6. Surface requirements

### 6.1 Gallery wall

Preserve the continuous horizontal wall and its existing interaction model:

- native touch/trackpad scrolling;
- mouse/wheel support supplied by `useHorizontalScroll`;
- thumbnail-to-wall synchronization;
- visible-artwork highlighting;
- left/right keyboard navigation when the wall is not covered;
- polite announcement of the current artwork.

Commerce on the wall is secondary. `ArtworkPurchaseCta` must:

- render only for a valid commerce record;
- show the effective price consistently with the editorial panel;
- use restrained “Studio offer” language instead of a loud “Sale” treatment;
- never enable purchase for sold or reserved works;
- stop pointer interaction from changing wall selection accidentally;
- open the in-app flow when it exists, with the validated external URL retained only as the Phase 1 fallback.

### 6.2 Collection grid

`HomePage` remains the alternate browsing surface. It must not become a generic product-card grid.

- Keep image, title, artist, and year as the primary card content.
- Do not add buttons, price badges, and availability chips to every card by default.
- If availability is added, use one quiet text state for reserved/sold only.
- Selecting a card continues to open `ArtworkPage`.

### 6.3 Editorial hero

`HeroSection` must continue to show artist name, artwork title, and the complete artwork at its natural aspect ratio without cropping or upscaling. Use a descriptive artwork alt text when editorial data provides one. Until then, `${title} by ${artist}` is the fallback. Price does not belong in this section.

### 6.4 Story and detail collage

`CollageSection` remains the exhibition-catalogue portion of the page.

- Display the short inspiration statement, materials, date, medium, and dimensions.
- Use `detailImages` and their focal positions when supplied.
- Retain existing CSS crops as a backwards-compatible fallback.
- On mobile, order content as story, materials, detail image, metadata, remaining imagery.
- Never narrow text merely to preserve the desktop two-column composition.

### 6.5 Interior visualization

`DetailsSection` must keep the interior photograph visually dominant.

- Preserve believable artwork scale and aspect ratio.
- Use room-specific placement rules for palette fallback images.
- Do not put price, heart, or large buttons over the room photograph.
- Place the commerce panel immediately below the image.
- The image alt must describe the composition without pretending it is a photograph of the buyer’s room.

### 6.6 Artwork commerce panel

The new `ArtworkCommercePanel` replaces duplicated price/action logic in `DetailsSection` and, where practical, shares pure helpers with `ArtworkPurchaseCta`.

It displays only verified values:

- artwork title and artist recap;
- “Original artwork” or “One of a kind” when policy supports it;
- current price;
- optional previous price and `offerLabel`;
- availability state;
- one primary action;
- a `ConfidenceStrip` made only from known policy data.

Preferred primary copy:

- available with in-app purchase: **Make this feeling yours**;
- available with external link only: **Purchase this piece**;
- reservation model: **Reserve this piece**;
- reserved: no active purchase action; optional enquiry/waitlist action only if implemented;
- sold: **Private collection**, plus an optional return-to-collection action.

Never show a confidence claim merely because the layout has space for it.

### 6.7 Confidence strip

Eligible items are signed by the artist, certificate included, worldwide shipping, insured shipping, an enforced reservation period, and “one original exists”. Render only facts present in the artwork or global business-policy configuration. Use a four-column row on wide screens, a two-column grid on tablets, and a stacked or two-column layout on small screens.

---

## 7. Purchase flow requirements

### 7.1 Phase 1: harden the current external handoff

Before implementing checkout, the current external-link model must be correct:

- Firestore maps `purchaseUrl`, `price`, `salePrice`, and `availability`.
- Price formatting accepts a currency instead of assuming USD forever.
- Sold and reserved works cannot open the external purchase URL.
- Invalid or non-HTTPS purchase URLs render no link.
- Wall and editorial commerce use the same effective-price and availability rules.

### 7.2 Phase 2: in-app purchase summary

Opening the action displays a modal/drawer owned by `GalleryPage`.

The summary shows artwork thumbnail, title, artist, effective price and currency, actual availability, truthful policy facts, a close action, and one explicit continuation action. Do not show configuration fields, quantity, unrelated upsells, or invented policy copy.

### 7.3 Phase 3: payment or reservation handoff

Choose exactly one business model before implementation:

1. immediate full payment;
2. free time-limited reservation;
3. paid deposit reservation.

The frontend must model the chosen behavior, not all three simultaneously.

For immediate payment, prefer a PCI-compliant hosted checkout or provider elements. Never collect or store raw card data. A client callback is not proof of payment; the backend/webhook is the source of truth.

For a free reservation, the backend must atomically change availability and provide a real expiry time. The frontend may display the period only after receiving it from the server.

### 7.4 Confirmation

Confirmation is driven by a backend response:

```ts
interface OrderConfirmation {
  orderId: string;
  artworkId: string;
  status: 'reserved' | 'paid' | 'processing' | 'shipped';
  amount: number;
  currency: string;
  reservationExpiresAt?: string;
  estimatedDelivery?: { min: number; max: number; unit: 'business-day' };
}
```

Do not fabricate delivery dates, order identifiers, or reservation expiry. Provide a return-to-collection action and refresh the collection after success so every mounted surface receives the new availability.

### 7.5 One-of-a-kind concurrency

The backend must enforce exclusivity transactionally:

```txt
available
   ↓ atomic checkout lock or reservation
checkout_pending / reserved
   ├── payment succeeds → sold
   └── failure or expiry → available
```

The purchase action must re-check availability when opened and again before confirmation. Do not optimistically mark an artwork sold. If another collector acquires it, preserve entered contact/address data where safe, explain the state calmly, and offer a return to available works.

---

## 8. Accessibility and overlay behavior

Every interactive surface must be keyboard and screen-reader usable.

- Use native buttons and links for actions.
- All icon-only buttons require accessible names.
- Visible focus must meet contrast requirements and use existing warm accent tokens.
- Respect `prefers-reduced-motion`.
- Do not use color as the only availability or error signal.
- The purchase overlay uses `role="dialog"`, `aria-modal="true"`, and a labelled heading.
- Focus moves into the dialog on open, remains trapped inside, and returns to the invoking control on close.
- Escape closes the dialog unless a non-interruptible provider handoff is in progress.
- Background wall, grid, and editorial page must be inert/hidden while covered.
- Validation appears after interaction or submission, not as an alarming initial error state.
- Loading uses the existing gallery-status visual language where it blocks the whole experience; local commerce loading stays inside the relevant panel.

---

## 9. Responsive behavior

Continue using the project’s current CSS breakpoints and fluid rules. Do not add a parallel JavaScript breakpoint system.

### Wide screens

- Maintain the immersive horizontal wall.
- Preserve asymmetric editorial layouts.
- Keep the room image large and the commerce panel compact.
- A purchase modal may be centered, with a maximum readable width.

### Tablets

- Reduce spacing without shrinking the artwork into a product thumbnail.
- Let the collage and metadata reflow when columns become narrow.
- Confidence items may use a two-column grid.

### Small screens

- Keep the wall touch-scrollable and thumbnails comfortably tappable.
- Stack the editorial collage in reading order.
- Keep commerce below the room image.
- Use a full-height sheet for the purchase flow.
- A sticky commerce bar may appear only after the commerce section has entered view and must disappear while any overlay is open.

---

## 10. Visual language

Preserve the established warm gallery and editorial themes.

- Serif typography: titles, emotional copy, price, and statements.
- Sans-serif typography: labels, facts, controls, and form text.
- Warm ivory/paper surfaces and charcoal/brown ink; avoid pure white and pure black where existing tokens provide a better value.
- Warm bronze or terracotta accents remain minor.
- Hairline borders, restrained shadows, and limited corner rounding.
- Artwork images may remain square-cornered.
- Motion should be subtle: opacity, small arrow shifts, and short translations. Avoid bounce and large scale effects.

Commerce language should be calm and exact. Prefer “Studio offer” over “Sale”, and “Previously $480” over promotional shouting.

---

## 11. API and service boundaries

Continue the existing adapter pattern. Components must not call Firebase or a payment provider directly.

Suggested additions:

```txt
src/api/
├── artworkApi.ts                    existing collection facade
├── commerceApi.ts                   UI-facing commerce facade
├── firebase/
│   └── mapArtworkDoc.ts             extended artwork parsing
└── commerce/
    ├── externalPurchaseApi.ts       Phase 1 validation/handoff
    └── checkoutApi.ts               later backend/provider calls
```

Potential UI-facing functions:

```ts
getArtworkAvailability(artworkId: string): Promise<ArtworkAvailability>;
startReservation(artworkId: string, input: ReservationInput): Promise<Reservation>;
createCheckoutSession(artworkId: string, input: CheckoutInput): Promise<CheckoutSession>;
getOrderConfirmation(orderId: string): Promise<OrderConfirmation>;
```

Use typed application errors with safe user-facing messages, following the existing `ArtworkApiError` pattern.

---

## 12. Navigation evolution

### Current increment

Keep state-based navigation. Browser refresh does not need to preserve the open editorial work or purchase step in the first commerce increment.

### Router migration gate

Add React Router only when at least one of these becomes a committed requirement:

- directly shareable artwork URLs;
- redirect return from hosted checkout;
- order-status pages;
- About, Contact, Sold, or legal pages;
- browser back/forward behavior across app surfaces.

At that point, map the existing surfaces without rewriting them:

```txt
/                    wall or collection landing
/art/:artworkId      ArtworkPage
/checkout/:artworkId purchase flow or provider return
/order/:orderId      confirmation/status
```

Use the artwork ID initially. Add a slug only when the data source provides a stable unique slug.

---

## 13. Performance and content integrity

- Preserve image aspect ratios to prevent layout shift.
- Do not upscale source artwork beyond its useful resolution.
- Lazy-load off-screen grid, wall, collage, and room images where it does not harm the opening viewport.
- Prioritize only the first meaningful wall artwork/background assets.
- Do not generate detail crops or interior scenes from CSS shapes.
- Artwork, interior, and artist images must have usage rights and a documented source.
- Cache invalidation must occur after a successful reservation/purchase; the existing 48-hour collection cache cannot keep stale availability.
- A failed optional image should degrade to an existing safe fallback without hiding factual artwork information.

---

## 14. Analytics and privacy

Analytics is optional and must not block commerce. If added, use stable artwork IDs and never include contact, address, payment, or free-text form data.

Recommended events:

```txt
gallery_artwork_selected
artwork_feature_opened
commerce_panel_viewed
purchase_flow_started
checkout_handoff_started
purchase_confirmed
purchase_failed
```

Favorites, if later added, may use local storage under a namespaced key and require no account in V1. Favorites are safe for optimistic UI; reservation and purchase are not.

---

## 15. Implementation phases

### Phase 0 — specification alignment

- Treat this document and the current source tree as the architecture baseline.
- Preserve current navigation, visual behavior, and API/provider boundaries.

### Phase 1 — commerce correctness

- Extend the Firestore mapper with current optional commerce fields.
- Centralize currency/effective-price/availability rules.
- Harden external purchase URLs.
- Make wall and editorial CTAs consistent.
- Rename mass-market sale copy to the quieter studio-offer treatment.

### Phase 2 — editorial conversion surface

- Extract `ArtworkCommercePanel` from `DetailsSection`.
- Add truthful confidence items.
- Support artwork-specific detail and interior images with existing fallbacks.
- Add responsive and accessibility coverage.

### Phase 3 — in-app summary overlay

- Add `PurchaseFlow` and let `GalleryPage` own its state.
- Implement focus management, covered-surface behavior, and current-availability recheck.
- Retain the external provider as the final handoff where applicable.

### Phase 4 — transactional backend

- Commit to one purchase/reservation model.
- Add atomic one-of-a-kind locking.
- Integrate a PCI-compliant payment provider if payment is required.
- Add server-confirmed success, expiry, conflict, and failure states.
- Invalidate/refetch the artwork collection on status change.

### Phase 5 — routes and supporting pages

- Add routing only when direct URLs or checkout return flows require it.
- Add order status, contact, about, legal, or sold archive pages as separately accepted scope.

---

## 16. Acceptance criteria

### Architecture

- The implementation extends the current component tree rather than replacing it with a speculative folder structure.
- `GalleryPage` remains the top-level UI coordinator until routing is introduced.
- Data-source details remain outside UI components.
- Current mock mode and Firestore mode expose equivalent artwork behavior.
- No global state library is added for local overlay state.

### Existing experience

- Wall scrolling, thumbnail synchronization, keyboard navigation, grid browsing, editorial stepping, and loading/error/empty states continue to work.
- Opening and closing editorial or commerce overlays does not reset the underlying gallery position.
- Covered surfaces cannot receive focus or react to hidden keyboard shortcuts.

### Artwork presentation

- The hero shows the uncropped artwork at its correct aspect ratio.
- The collage uses curated detail images when available and preserves the current fallback otherwise.
- The interior composition uses an artwork-specific image, palette room, or generic room in that order.
- Mobile layouts remain readable and do not cover the artwork with commerce controls.

### Commerce

- Missing price or action data produces no misleading partial CTA.
- Currency and effective price match in every surface.
- Studio offers are computed from data rather than hardcoded copy.
- Sold and reserved artworks cannot be purchased through stale UI.
- Confidence statements appear only when supported by data or configured policy.
- No variant, frame, size, or quantity controls exist.
- A server, not the frontend, decides reservation and sale success.

### Accessibility and quality

- Keyboard focus, focus return, Escape handling, accessible names, and dialog semantics are verified.
- Reduced-motion preferences are respected.
- Layout is usable on wide, tablet, and small screens.
- `yarn build` succeeds.
- Tests cover price/offer calculation, availability gating, Firestore mapping, and the purchase-flow state transitions introduced by the implemented phase.

---

## 17. Explicit non-goals for the first extension

- Rebuilding the application around a router before URLs require it.
- Introducing Redux, TanStack Query, Tailwind, CSS Modules, Storybook, or a generic component library.
- Supporting carts or multi-item checkout.
- Supporting artwork variants or configuration.
- Adding authentication for favorites.
- Building About, Contact, Sold, Order, or legal pages without separate requirements.
- Claiming shipping, certificates, signatures, reservation periods, or delivery estimates without a real source of truth.

---

## 18. Detailed visual specification from the supplied reference

The supplied image is a visual direction board, not a literal final screen. Its sample artwork title, EUR price, delivery estimate, shipping promise, certificate promise, seven-day reservation, payment-card data, and confirmation text are placeholders until supported by application data and business policy. In production, the three transaction cards must appear one at a time as modal or sheet states; they must not be displayed side by side below the artwork as shown in the presentation board.

### 18.1 Section order inside `ArtworkPage`

```txt
HeroSection
CollageSection
DetailsSection
├── InteriorStage
│   ├── artwork placed in room
│   ├── PricePlaque
│   ├── FavoriteButton (future/optional)
│   └── EmotionalPurchaseButton
├── ConfidenceStrip
└── ArtworkCommercePanel

PurchaseFlow (portal/overlay above ArtworkPage)
├── PurchaseSummary
├── CheckoutForm or external checkout handoff
└── PurchaseConfirmation
```

The price plaque and emotional button may overlay the interior image because they are short, high-value controls. All explanatory commerce text, policy detail, and secondary actions must remain below the image.

### 18.2 Interior stage composition

The interior stage is a wide editorial image intended to answer one question: “How could this work change the feeling of a room?”

Desktop specification:

- maximum content width follows the current `ArtworkPage` editorial container;
- image aspect ratio should be approximately `16 / 10` to `3 / 2`, depending on the real source image;
- minimum visible height should be `clamp(520px, 68vw, 820px)` without stretching the image;
- use `object-fit: cover` for the room photograph only;
- preserve the artwork itself as an independently positioned layer with `object-fit: contain` and its real aspect ratio;
- use a restrained `16–24px` container radius only if consistent with the final `DetailsSection` design;
- use a warm, soft shadow no darker than `rgba(35, 28, 20, 0.10)`;
- keep at least `24px` between controls and the image boundary;
- maintain a safe zone around the artwork so controls never cover it.

The room image and artwork composition must be prepared per room. A single generic percentage placement cannot be assumed to work for every photograph. Existing `data-room` CSS rules remain the fallback; future content should provide tested placement data or a finished composite image.

Suggested optional placement model:

```ts
interface InteriorPlacement {
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  rotationDeg?: number;
  shadow?: 'none' | 'soft' | 'frame';
}
```

Do not expose this data to buyers. It is presentation metadata managed with the artwork or interior asset.

### 18.3 Price plaque

Position the plaque in the upper-left safe area when it does not obscure art, windows, or important room details. Otherwise, move it to the lower-left or place it below the image.

Content order:

```txt
ORIGINAL ARTWORK
$480
ONE OF A KIND
```

For a studio offer:

```txt
STUDIO OFFER
$420
Previously $480
```

Visual rules:

- warm espresso or translucent charcoal background;
- ivory foreground text;
- serif price, sans-serif labels;
- `10–12px` uppercase label with `0.12–0.18em` tracking;
- price approximately `30–38px` on desktop and `24–30px` on small screens;
- `12–16px` internal padding;
- maximum width around `150px`;
- optional fine border using a low-opacity ivory;
- no red, bright green, starburst, percentage badge, or countdown;
- no plaque at all when the price is missing.

The offer value is always computed. Never hardcode “Save $60” independently of `price` and `salePrice`.

### 18.4 Emotional purchase button

Place the primary CTA in the lower-right safe area on desktop. It should visually echo a gallery caption rather than a conventional shopping button.

Recommended content:

```txt
✦  Make this feeling yours.  →
```

Behavior:

- pressing it opens `PurchaseFlow` at `summary`;
- it must not immediately charge, reserve, or navigate away without a clear next step;
- the entire pill is a single button with one accessible name;
- hover shifts the arrow by no more than `4–6px` and slightly changes the surface tone;
- active state compresses by no more than `1px` or changes shadow intensity;
- focus uses the existing bronze focus treatment;
- reduced-motion mode removes translation;
- loading state keeps the label stable and adds a small non-distracting progress indicator;
- sold and reserved works replace or remove the CTA according to their state.

Desktop sizing:

- height `68–82px`;
- width `280–360px` depending on copy;
- horizontal padding `28–36px`;
- large pill radius;
- warm raised paper surface with dark editorial text.

Small-screen behavior:

- move the CTA below the image when an overlay would cover the painting or become narrower than `240px`;
- use full available width with a minimum `52px` touch height;
- keep price and CTA in one compact commerce block;
- never position the CTA on top of essential artwork content.

### 18.5 Favorite control

The circular heart control in the reference is optional and outside the first commerce-critical increment. If implemented:

- place it in an image safe area opposite the price plaque;
- use a `48–56px` circular button on desktop and at least `44px` on touch devices;
- store anonymous favorites in local storage;
- expose `aria-pressed` and a label that changes between “Save artwork” and “Remove artwork from saved works”;
- optimistically update the heart because this state is local and reversible;
- do not require sign-in;
- do not imply that saving reserves the artwork.

### 18.6 Confidence strip

Place the confidence strip `24–32px` below the interior stage. It is a quiet policy summary, not a row of marketing badges.

Each item contains:

1. one thin-line icon;
2. one uppercase label;
3. one short factual sentence.

Example items are eligible only when verified:

| Label | Detail | Required source |
| --- | --- | --- |
| Authentic | Original artwork signed by the artist | `commerce.signed === true` |
| Insured shipping | Carefully packaged and fully insured | global shipping policy or artwork shipping data |
| Certificate included | Certificate of authenticity included | `commerce.certificateIncluded === true` |
| 7-day reserve | Held for seven days after confirmation | backend-enforced `reservationDays === 7` |

Desktop layout uses up to four equal columns separated by hairlines. Tablet uses two columns. Mobile uses a single column or two columns only when every label and sentence remains readable. Hide unsupported items rather than leaving an empty column.

### 18.7 Commerce panel below the stage

The persistent panel beneath the interior stage provides a non-overlay fallback and a clear summary for users who miss or cannot use the over-image CTA.

It contains:

- title and artist;
- availability label when reserved or sold;
- effective price and currency;
- previous price and studio-offer label when applicable;
- one primary purchase/reservation action;
- optional private enquiry link only when an enquiry destination exists.

Do not repeat long confidence text in this panel. The price plaque, over-image CTA, confidence strip, and commerce panel must share the same helpers so they cannot disagree.

---

## 19. Detailed purchase-window specification

### 19.1 Presentation model

The reference shows three cards concurrently to explain the flow. The real interface shows only the active state:

```txt
closed
  ↓ click emotional CTA
summary
  ↓ continue
checkout / hosted-provider handoff
  ↓ backend-confirmed success
confirmation
```

On desktop, use a centered dialog with a dimmed warm overlay. On mobile, use a full-height sheet. The active artwork page remains mounted underneath, visually softened and inert.

Recommended dialog dimensions:

- summary: `min(440px, calc(100vw - 32px))`;
- checkout: `min(560px, calc(100vw - 32px))`;
- confirmation: `min(480px, calc(100vw - 32px))`;
- maximum height `calc(100dvh - 48px)` with internal scrolling;
- surface color `--editorial-paper-bg-raised`;
- border `1px solid var(--editorial-line)`;
- radius `16–20px`;
- shadow approximately `0 24px 80px rgba(35, 28, 20, 0.16)`.

### 19.2 Window 1 — purchase or reservation summary

Purpose: confirm the exact work and explain the real next action before asking for customer details or leaving for hosted checkout.

Required content order:

1. close button;
2. artwork thumbnail with meaningful alt text;
3. artwork title;
4. artist name;
5. effective price and currency;
6. availability;
7. verified fulfillment/reservation facts;
8. primary continuation button;
9. optional policy/details link.

The thumbnail should be `88–120px`, use the artwork’s real aspect ratio, and never be circular-cropped unless the crop is a deliberately approved brand treatment. A rectangular or softly rounded miniature is more truthful to the physical work.

CTA labels by model:

- immediate payment: **Continue to secure checkout**;
- free reservation: **Reserve this piece**;
- paid deposit: **Continue to deposit**;
- external provider fallback: **Continue to purchase**.

If availability changes while the dialog is open, replace the primary action with the new state and a calm explanation. Do not close the dialog without context.

### 19.3 Window 2 — secure checkout

This state exists only when the chosen backend/payment architecture supports in-app customer-detail collection. If a hosted checkout owns these fields, show a brief secure-handoff state instead and let the provider collect them.

Minimum contact and delivery fields:

```ts
interface CheckoutInput {
  email: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
}
```

Form order:

1. email;
2. full name;
3. address line 1;
4. optional address line 2;
5. city and postal code;
6. region when required by country;
7. country;
8. provider-controlled payment element when applicable;
9. order-total summary;
10. terms acknowledgement;
11. final payment/reservation button.

Form design:

- labels remain visible above inputs; placeholders are examples, not labels;
- input height at least `46px`;
- use `8–10px` radius and a subtle warm border;
- errors appear directly below their field after blur or submit;
- move focus to the first invalid field after submit;
- preserve entered non-payment values after recoverable errors;
- disable double submission;
- final button includes the exact action and total, such as **Pay $480 securely**;
- never render mock card digits or a provider logo unless produced by the real payment component.

Security microcopy should be modest and accurate. Do not claim “100% secure” or “encrypted” unless the statement is reviewed and correctly describes the system.

### 19.4 Window 3 — confirmation

The confirmation appears only after the application receives a trusted successful result.

Required content:

- calm success icon;
- state-specific heading: “Your piece is reserved” or “Your artwork is yours”;
- artwork title;
- order or reservation reference;
- verified email-delivery statement if an email was actually queued;
- reservation expiry or delivery estimate only when returned by the backend;
- next operational step;
- primary action to view order/status when that destination exists;
- secondary action back to the collection.

Do not show “View order” without an implemented destination. In that case, make “Back to collection” the primary action. Closing confirmation must refresh/invalidate the artwork collection and display the server-confirmed availability everywhere.

### 19.5 Failure and interruption states

The flow must explicitly design these states:

- artwork became reserved or sold;
- availability check timed out;
- checkout-session creation failed;
- provider was cancelled by the user;
- payment failed but can be retried;
- payment result is pending;
- reservation expired;
- network connection was lost;
- confirmation retrieval failed after a likely successful payment.

For uncertain payment outcomes, never tell the user to pay again immediately. Show a pending state, keep the reference/session ID, and provide a safe retry/status-check path.

---

## 20. Concrete content and data checklist

Before any “real details” can appear, the product owner must provide or approve the following sources of truth:

### Artwork record

- final title and artist spelling;
- original image and descriptive alt text;
- creation date, medium, and physical dimensions;
- real selling price and currency;
- optional studio-offer price and label;
- current availability;
- signature status;
- certificate status;
- final artwork-specific interior image or approved room/placement;
- valid purchase destination or commerce backend ID.

### Global business policy

- immediate purchase, free reservation, or deposit model;
- reservation duration and expiry rules;
- countries served;
- shipping-price calculation;
- insurance policy;
- packaging method;
- returns/cancellation policy;
- taxes/duties responsibility;
- payment provider;
- customer-support and private-enquiry destination;
- confirmation-email behavior;
- privacy, terms, and refund-page destinations.

### Copy rules

- Use “Book” only for a genuine temporary hold or appointment-like action.
- Use “Reserve” only when availability is locked for a defined period.
- Use “Purchase” or “Own this piece” for immediate full payment.
- Use “Original artwork” only for an original physical work.
- Use “One of a kind” only when no duplicate original exists.
- Use “Free shipping”, “insured”, “certificate included”, and delivery ranges only when verified.

---

## 21. Implementation-ready interaction contract

Recommended prop boundaries for the future implementation:

```ts
interface ArtworkCommercePanelProps {
  artwork: Artwork;
  onStartPurchase: (artworkId: string) => void;
  onPrivateEnquiry?: (artworkId: string) => void;
}

interface PurchaseFlowProps {
  artwork: Artwork;
  state: PurchaseFlowState;
  onClose: () => void;
  onStepChange: (step: PurchaseFlowStep) => void;
  onCompleted: (confirmation: OrderConfirmation) => void;
}
```

Pure commerce helpers should be unit tested:

```ts
getEffectivePrice(artwork): number | null;
getArtworkCurrency(artwork): SupportedCurrency;
getAcquisitionState(artwork): 'hidden' | 'available' | 'reserved' | 'sold';
getOfferDetails(artwork): OfferDetails | null;
getConfidenceItems(artwork, policy): ConfidenceItem[];
isSafePurchaseUrl(value): boolean;
```

`DetailsSection`, `ArtworkPurchaseCta`, and `PurchaseFlow` must consume these helpers rather than each implementing price and availability rules independently.

---

## 22. Final product rule

Every extension should preserve this sequence:

```txt
see the work → understand the work → imagine living with it → verify the facts → acquire it calmly
```

If a commerce element competes with the artwork before the user reaches the decision point, it is too prominent. If a commerce claim is not backed by data or enforced policy, it must not be shown.
