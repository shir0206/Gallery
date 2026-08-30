# Artwork Page Museum Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current single-scroll `ArtworkPage` "feature spread" with a four-part, full-viewport scrollytelling experience per artwork: an animated hero, a collage of cropped details + unlabeled text, a full catalogue-facts page, and an "in your house" mockup with a purchase link.

**Architecture:** `ArtworkPage.tsx` becomes a thin orchestrator that renders a fixed back/stepper "chrome" bar over a vertically snap-scrolling container of four new `<section>` components (`HeroSection`, `CollageSection`, `DetailsSection`, `InYourHouseSection`), each in its own file pair under `src/pages/ArtworkPage/sections/`. All four consume the existing `Artwork` shape (plus one new optional field, `purchaseUrl`) — no new API endpoints or data-layer changes.

**Tech Stack:** React 18 + TypeScript + Vite, plain CSS per component (no CSS-in-JS, no animation library — this repo has neither today and the effects needed don't require one). Handwriting title effect: a Google Fonts cursive face (`Caveat`) + per-letter CSS keyframe stagger + an inline SVG stroke-draw flourish, no JS animation library.

**Spec:** This document — no separate spec file; requirements are the user's page-by-page description reproduced in Global Constraints below.

## Global Constraints

- Page 1 (hero): artist name, then the painting title rendered with a "handwriting" reveal animation, then the image at its own aspect ratio and natural pixel size (never cropped, never upscaled beyond its natural size).
- Page 2 (collage): the same painting duplicated three times, each duplicate a differently-sized rectangle/square showing an enlarged crop of a different part of the painting; plus three sentences (story, materials, description) at three visibly different sizes; no titles anywhere on this page — text only.
- Page 3 (details): date, medium, dimensions, category — given a full page, not a collapsed disclosure.
- Page 4 (in your house): a living-room photo with the painting composited on top of it, plus a link to purchase the piece, overlaid on the image.
- No automated test suite exists in this repo (no test script, no vitest/jest config) — every task's verification step is a manual visual check via `yarn dev`, plus `yarn build` for type-safety, in place of the usual "run the test" step.
- Match the existing editorial theme tokens in `frontend/src/styles/global.css` (`--gallery-serif`, `--gallery-sans`, `--editorial-*`) rather than inventing a new palette — this is still the same museum site, just a different page shape.
- Preserve the existing `1023px` / `639px` breakpoint convention and the existing `prefers-reduced-motion: reduce` handling pattern (see current `ArtworkPage.css`).
- Every new/changed file lives under `frontend/src/`; all imports use the existing `@/` alias (`frontend/vite.config.ts` + `frontend/tsconfig.json`).

---

## File Structure

- **Modify** `frontend/index.html` — add the `Caveat` handwriting font to the existing Google Fonts `<link>`.
- **Modify** `frontend/src/types/artwork.ts` — add optional `purchaseUrl?: string` to `Artwork`.
- **Modify** `frontend/src/api/mock/mockArtworkData.ts` — add `purchaseUrl` to one mock artwork, leave another without it, so both branches of the Page 4 purchase link are exercised.
- **Modify** `frontend/src/assets/README.md` — document the new `living-room-placeholder.jpg` asset.
- **Create** `frontend/src/assets/living-room-placeholder.jpg` — a placeholder interior photo (asset-sourcing step, not code).
- **Create** `frontend/src/pages/ArtworkPage/HandwrittenTitle.tsx` + `.css` — the reusable animated-title component used by `HeroSection`.
- **Create** `frontend/src/pages/ArtworkPage/sections/HeroSection.tsx` + `.css` — Page 1.
- **Create** `frontend/src/pages/ArtworkPage/sections/CollageSection.tsx` + `.css` — Page 2.
- **Create** `frontend/src/pages/ArtworkPage/sections/DetailsSection.tsx` + `.css` — Page 3.
- **Create** `frontend/src/pages/ArtworkPage/sections/InYourHouseSection.tsx` + `.css` — Page 4.
- **Modify** `frontend/src/pages/ArtworkPage/ArtworkPage.tsx` — becomes the orchestrator (chrome bar + scroll-snap container of the four sections above). Props (`artwork`, `onBack`, `onPrevious`, `onNext`) are unchanged, so `GalleryPage.tsx` needs no changes.
- **Modify** `frontend/src/pages/ArtworkPage/ArtworkPage.css` — replaced with the chrome-bar/scroll-container styles; the old hero/body/facts rules move into the new section-specific CSS files (or are superseded by them).

---

### Task 1: Foundation — `purchaseUrl` field, mock data, handwriting font, asset slot

**Files:**
- Modify: `frontend/src/types/artwork.ts`
- Modify: `frontend/src/api/mock/mockArtworkData.ts`
- Modify: `frontend/index.html`
- Modify: `frontend/src/assets/README.md`
- Create: `frontend/src/assets/living-room-placeholder.jpg`

**Interfaces:**
- Produces: `Artwork.purchaseUrl?: string` — consumed by `InYourHouseSection` (Task 5) to decide whether to render the purchase CTA.
- Produces: `frontend/src/assets/living-room-placeholder.jpg` — consumed by `InYourHouseSection` (Task 5) via a static `import`.
- Produces: the `Caveat` font family, loaded globally — consumed by `HandwrittenTitle.css` (Task 2).

- [ ] **Step 1: Add `purchaseUrl` to the `Artwork` type**

In `frontend/src/types/artwork.ts`, add the field after `palette`:

```ts
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  medium: string;
  dimensions: ArtworkDimensions;
  category: string[];
  status: string;
  description: ArtworkDescription;
  imageUrl: string;
  orientation: ArtworkOrientation;
  palette: ArtworkPalette;
  /** External link to buy this piece. Optional — when absent, the
   * "in your house" page's purchase CTA is omitted entirely rather
   * than pointing somewhere generic. */
  purchaseUrl?: string;
}
```

- [ ] **Step 2: Add `purchaseUrl` to one mock artwork, leave another without it**

In `frontend/src/api/mock/mockArtworkData.ts`, add a `purchaseUrl` field to the `"Butterflies"` entry (id `"0"`) right after its `palette` field:

```ts
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    purchaseUrl: "https://example.com/purchase/butterflies",
  },
```

Leave the `"Girl With Pearl Earring"` entry (id `"1"`) as-is, with no `purchaseUrl` — this is what lets Task 5's verification step confirm both the "link shown" and "link omitted" branches.

- [ ] **Step 3: Load the `Caveat` handwriting font**

In `frontend/index.html`, extend the existing Google Fonts `<link>` (don't add a second `<link>` — one request for all three families):

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@300;400;500&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 4: Source a placeholder living-room photo**

Add any interior/living-room photo you have the rights to use as `frontend/src/assets/living-room-placeholder.jpg`. This follows the existing convention documented in `frontend/src/assets/README.md` for `gallery-background-placeholder.jpg` — a stand-in checked in now, swapped for a real photographed room later. A plain, mostly-empty wall shot works best since Task 5 composites the painting on top of it.

- [ ] **Step 5: Document the new asset**

Append to `frontend/src/assets/README.md`:

```md

`living-room-placeholder.jpg` is used by the artwork page's "in your
house" section (`ArtworkPage/sections/InYourHouseSection.tsx`) as the
backdrop the painting is composited onto. Swap it for a real
photographed room with a clear, mostly-empty wall.
```

- [ ] **Step 6: Verify**

Run:

```bash
cd frontend && yarn build
```

Expected: the build succeeds with no TypeScript errors (the new optional field doesn't break any existing `Artwork` consumer).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/types/artwork.ts frontend/src/api/mock/mockArtworkData.ts frontend/index.html frontend/src/assets/README.md frontend/src/assets/living-room-placeholder.jpg
git commit -m "feat(artwork-page): add purchaseUrl field, handwriting font, living-room asset slot"
```

---

### Task 2: `HandwrittenTitle` — the handwriting-reveal animated title

**Files:**
- Create: `frontend/src/pages/ArtworkPage/HandwrittenTitle.tsx`
- Create: `frontend/src/pages/ArtworkPage/HandwrittenTitle.css`

**Interfaces:**
- Consumes: nothing new (plain `text: string` prop).
- Produces: `HandwrittenTitle({ text }: { text: string })` — a React component — consumed by `HeroSection` (Task 3) as `<HandwrittenTitle text={artwork.title} />`.

- [ ] **Step 1: Create the component**

`frontend/src/pages/ArtworkPage/HandwrittenTitle.tsx`:

```tsx
import './HandwrittenTitle.css';

interface HandwrittenTitleProps {
  text: string;
}

/**
 * Renders `text` as a handwriting-style reveal: each character fades
 * and settles in with a slight rotation, staggered left to right,
 * then a hand-drawn underline flourish draws itself beneath the word.
 * The per-letter spans are `aria-hidden`; a visually-hidden sibling
 * carries the real text for screen readers, so assistive tech reads
 * one clean string instead of one node per letter.
 */
export function HandwrittenTitle({ text }: HandwrittenTitleProps) {
  const letters = text.split('');

  return (
    <span className="handwritten-title">
      <span className="handwritten-title-word" aria-hidden="true">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="handwritten-title-letter"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </span>
      <span className="visually-hidden">{text}</span>
      <svg
        className="handwritten-title-flourish"
        viewBox="0 0 220 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M4 14 C 40 4, 70 20, 110 10 S 180 2, 216 14"
          pathLength="100"
          style={{ animationDelay: `${letters.length * 45 + 150}ms` }}
        />
      </svg>
    </span>
  );
}
```

- [ ] **Step 2: Style it**

`frontend/src/pages/ArtworkPage/HandwrittenTitle.css`:

```css
.handwritten-title {
  position: relative;
  display: inline-block;
}

.handwritten-title-word {
  font-family: 'Caveat', var(--gallery-serif);
  font-weight: 600;
  font-size: inherit;
  display: inline-block;
}

.handwritten-title-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px) rotate(-4deg);
  animation: handwritten-letter-in 0.4s ease-out forwards;
}

@keyframes handwritten-letter-in {
  to {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

.handwritten-title-flourish {
  display: block;
  width: 100%;
  height: 14px;
  margin-top: 2px;
  overflow: visible;
}

.handwritten-title-flourish path {
  fill: none;
  stroke: var(--editorial-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: handwritten-flourish-draw 0.6s ease-out forwards;
}

@keyframes handwritten-flourish-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .handwritten-title-letter {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .handwritten-title-flourish path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
```

- [ ] **Step 3: Verify**

This component has no isolated harness (no Storybook in this repo) and no consumer yet, so verify it together with Task 3 — skip a standalone visual check here and fold verification into Task 3's Step 4.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ArtworkPage/HandwrittenTitle.tsx frontend/src/pages/ArtworkPage/HandwrittenTitle.css
git commit -m "feat(artwork-page): add HandwrittenTitle animated-title component"
```

---

### Task 3: `HeroSection` — Page 1

**Files:**
- Create: `frontend/src/pages/ArtworkPage/sections/HeroSection.tsx`
- Create: `frontend/src/pages/ArtworkPage/sections/HeroSection.css`

**Interfaces:**
- Consumes: `HandwrittenTitle` from `../HandwrittenTitle` (Task 2); `Artwork` from `@/types/artwork`.
- Produces: `HeroSection({ artwork }: { artwork: Artwork })` — consumed by `ArtworkPage.tsx` (Task 6).

- [ ] **Step 1: Create the component**

`frontend/src/pages/ArtworkPage/sections/HeroSection.tsx`:

```tsx
import type { Artwork } from '@/types/artwork';
import { HandwrittenTitle } from '../HandwrittenTitle';
import './HeroSection.css';

interface HeroSectionProps {
  artwork: Artwork;
}

/**
 * Page 1: artist byline, an animated handwriting-style title, and the
 * artwork reproduced at its own aspect ratio and natural pixel size —
 * never cropped, never upscaled — so the first thing a visitor sees
 * is the whole, uncut piece.
 */
export function HeroSection({ artwork }: HeroSectionProps) {
  return (
    <section className="hero-section" aria-label={`${artwork.title}, hero`}>
      <p className="hero-section-artist">{artwork.artist}</p>
      <h1 className="hero-section-title">
        <HandwrittenTitle text={artwork.title} />
      </h1>
      <img
        src={artwork.imageUrl}
        alt={`${artwork.title} by ${artwork.artist}`}
        className="hero-section-image"
      />
    </section>
  );
}
```

- [ ] **Step 2: Style it**

`frontend/src/pages/ArtworkPage/sections/HeroSection.css`:

```css
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 120px 24px 64px;
  text-align: center;
}

.hero-section-artist {
  margin: 0;
  font-family: var(--gallery-sans);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--editorial-ink-muted);
}

.hero-section-title {
  margin: 0;
  font-size: 44px;
  line-height: 1.1;
  color: var(--editorial-ink);
}

.hero-section-image {
  display: block;
  max-width: min(90vw, 900px);
  max-height: 65vh;
  width: auto;
  height: auto;
  box-shadow: 0 24px 60px rgba(43, 36, 29, 0.18);
}

@media (max-width: 639px) {
  .hero-section {
    padding: 96px 18px 48px;
  }

  .hero-section-title {
    font-size: 30px;
  }

  .hero-section-image {
    max-height: 55vh;
  }
}
```

- [ ] **Step 3: Temporarily mount it to verify**

In `frontend/src/pages/ArtworkPage/ArtworkPage.tsx`, temporarily replace the current JSX body with `return <HeroSection artwork={artwork} />;` (adding the import) purely to preview this section in isolation before the full Task 6 rewrite — this throwaway wiring gets replaced wholesale in Task 6, so don't commit it.

- [ ] **Step 4: Verify**

Run:

```bash
cd frontend && yarn dev
```

Open the printed local URL, navigate to any artwork's feature spread, and confirm:
- The artist name appears above the title in small caps.
- The title's letters fade/settle in left-to-right in a cursive handwriting face, followed by a small hand-drawn underline that draws itself.
- Reloading with OS-level "reduce motion" enabled shows the title fully formed immediately, no animation.
- The image is not cropped and does not exceed its natural pixel size or ~65% of the viewport height.

- [ ] **Step 5: Revert the throwaway wiring from Step 3**

```bash
git checkout -- frontend/src/pages/ArtworkPage/ArtworkPage.tsx
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/ArtworkPage/sections/HeroSection.tsx frontend/src/pages/ArtworkPage/sections/HeroSection.css
git commit -m "feat(artwork-page): add HeroSection (page 1)"
```

---

### Task 4: `CollageSection` — Page 2

**Files:**
- Create: `frontend/src/pages/ArtworkPage/sections/CollageSection.tsx`
- Create: `frontend/src/pages/ArtworkPage/sections/CollageSection.css`

**Interfaces:**
- Consumes: `Artwork` from `@/types/artwork` (`imageUrl`, `description.inspiration/materials/visual`, `title`).
- Produces: `CollageSection({ artwork }: { artwork: Artwork })` — consumed by `ArtworkPage.tsx` (Task 6).

- [ ] **Step 1: Create the component**

`frontend/src/pages/ArtworkPage/sections/CollageSection.tsx`:

```tsx
import type { CSSProperties } from 'react';
import type { Artwork } from '@/types/artwork';
import './CollageSection.css';

interface CollageSectionProps {
  artwork: Artwork;
}

/**
 * Page 2: a collage built from three cropped, enlarged fragments of
 * the same painting and three unlabeled sentences (story, materials,
 * description) set at three different sizes — no visible headings;
 * the size hierarchy alone signals which sentence carries the most
 * weight. The three crops share one `background-image` via a CSS
 * custom property so the image URL isn't repeated three times.
 */
export function CollageSection({ artwork }: CollageSectionProps) {
  const collageStyle = {
    '--collage-image': `url(${artwork.imageUrl})`,
  } as CSSProperties;

  return (
    <section
      className="collage-section"
      style={collageStyle}
      aria-label={`${artwork.title}, in detail`}
    >
      <h2 className="visually-hidden">Details of {artwork.title}</h2>
      <div className="collage-crop collage-crop-a" aria-hidden="true" />
      <p className="collage-text collage-text-story">{artwork.description.inspiration}</p>
      <div className="collage-crop collage-crop-b" aria-hidden="true" />
      <p className="collage-text collage-text-materials">{artwork.description.materials}</p>
      <div className="collage-crop collage-crop-c" aria-hidden="true" />
      <p className="collage-text collage-text-description">{artwork.description.visual}</p>
    </section>
  );
}
```

- [ ] **Step 2: Style it**

`frontend/src/pages/ArtworkPage/sections/CollageSection.css`:

```css
.collage-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 24px 64px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 44px;
  gap: 16px;
  align-content: center;
}

.collage-crop {
  background-image: var(--collage-image);
  background-repeat: no-repeat;
  background-size: 280% auto;
  box-shadow: 0 16px 40px rgba(43, 36, 29, 0.16);
}

.collage-crop-a {
  grid-column: 1 / 7;
  grid-row: 1 / 6;
  background-position: 15% 25%;
}

.collage-crop-b {
  grid-column: 8 / 11;
  grid-row: 3 / 7;
  background-position: 70% 60%;
  z-index: 2;
}

.collage-crop-c {
  grid-column: 5 / 9;
  grid-row: 7 / 10;
  background-position: 45% 85%;
  z-index: 2;
}

.collage-text {
  margin: 0;
  align-self: center;
  font-family: var(--gallery-serif);
  color: var(--editorial-ink);
}

.collage-text-story {
  grid-column: 7 / 13;
  grid-row: 1 / 4;
  font-size: 30px;
  line-height: 1.35;
}

.collage-text-materials {
  grid-column: 1 / 5;
  grid-row: 6 / 8;
  font-size: 18px;
  line-height: 1.5;
  color: var(--editorial-ink-soft);
  z-index: 1;
}

.collage-text-description {
  grid-column: 9 / 13;
  grid-row: 8 / 10;
  font-size: 13px;
  font-style: italic;
  line-height: 1.6;
  color: var(--editorial-ink-muted);
}

@media (max-width: 1023px) {
  .collage-section {
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: 36px;
    padding: 80px 20px 56px;
  }

  .collage-crop-a { grid-column: 1 / 7; grid-row: 1 / 6; }
  .collage-text-story { grid-column: 1 / 7; grid-row: 6 / 9; font-size: 24px; }
  .collage-crop-b { grid-column: 1 / 4; grid-row: 9 / 13; }
  .collage-text-materials { grid-column: 4 / 7; grid-row: 9 / 12; font-size: 16px; }
  .collage-crop-c { grid-column: 1 / 5; grid-row: 13 / 17; }
  .collage-text-description { grid-column: 5 / 7; grid-row: 13 / 16; font-size: 13px; }
}

@media (max-width: 639px) {
  .collage-section {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 20px;
    padding: 72px 18px 48px;
  }

  .collage-crop-a,
  .collage-crop-b,
  .collage-crop-c,
  .collage-text-story,
  .collage-text-materials,
  .collage-text-description {
    grid-column: 1;
    grid-row: auto;
  }

  .collage-crop-a { height: 260px; }
  .collage-crop-b { height: 200px; }
  .collage-crop-c { height: 180px; }

  .collage-text-story { font-size: 24px; order: -1; }
}
```

- [ ] **Step 3: Temporarily mount it to verify**

Same throwaway technique as Task 3, Step 3: temporarily render `<CollageSection artwork={artwork} />` from `ArtworkPage.tsx`, don't commit the wiring change.

- [ ] **Step 4: Verify**

With `yarn dev` running, confirm:
- Three image crops appear at three visibly different sizes, each showing a different part of the same painting (not the same crop repeated).
- The three sentences appear at three visibly different font sizes, with no label/heading text anywhere on the page.
- At a mobile viewport width (≤639px, e.g. via devtools device toolbar), everything stacks into a single column with the story sentence first.

- [ ] **Step 5: Revert the throwaway wiring**

```bash
git checkout -- frontend/src/pages/ArtworkPage/ArtworkPage.tsx
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/ArtworkPage/sections/CollageSection.tsx frontend/src/pages/ArtworkPage/sections/CollageSection.css
git commit -m "feat(artwork-page): add CollageSection (page 2)"
```

---

### Task 5: `DetailsSection` and `InYourHouseSection` — Pages 3 and 4

**Files:**
- Create: `frontend/src/pages/ArtworkPage/sections/DetailsSection.tsx`
- Create: `frontend/src/pages/ArtworkPage/sections/DetailsSection.css`
- Create: `frontend/src/pages/ArtworkPage/sections/InYourHouseSection.tsx`
- Create: `frontend/src/pages/ArtworkPage/sections/InYourHouseSection.css`

**Interfaces:**
- Consumes: `Artwork` from `@/types/artwork`; `formatArtworkDate`/`formatArtworkDimensions` from `@/utils`; `living-room-placeholder.jpg` from `@/assets` (Task 1).
- Produces: `DetailsSection({ artwork })` and `InYourHouseSection({ artwork })` — both consumed by `ArtworkPage.tsx` (Task 6).

- [ ] **Step 1: Create `DetailsSection`**

`frontend/src/pages/ArtworkPage/sections/DetailsSection.tsx`:

```tsx
import type { Artwork } from '@/types/artwork';
import { formatArtworkDate, formatArtworkDimensions } from '@/utils';
import './DetailsSection.css';

interface DetailsSectionProps {
  artwork: Artwork;
}

/**
 * Page 3: the catalogue facts — date, medium, dimensions, category —
 * given a full section instead of the collapsed disclosure the old
 * single-scroll spread used, since here it isn't competing with a
 * narrative paragraph for space.
 */
export function DetailsSection({ artwork }: DetailsSectionProps) {
  const { day, month, year, dimensions } = artwork;

  return (
    <section className="details-section" aria-label={`${artwork.title}, details`}>
      <dl className="details-section-facts">
        <div className="details-section-fact">
          <dt>Date</dt>
          <dd>{formatArtworkDate(day, month, year)}</dd>
        </div>
        <div className="details-section-fact">
          <dt>Medium</dt>
          <dd>{artwork.medium}</dd>
        </div>
        <div className="details-section-fact">
          <dt>Dimensions</dt>
          <dd>{formatArtworkDimensions(dimensions.width, dimensions.height, dimensions.unit)}</dd>
        </div>
        {artwork.category.length > 0 && (
          <div className="details-section-fact">
            <dt>Category</dt>
            <dd>{artwork.category.join(', ')}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
```

- [ ] **Step 2: Style `DetailsSection`**

`frontend/src/pages/ArtworkPage/sections/DetailsSection.css`:

```css
.details-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
}

.details-section-facts {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-section-fact {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  border-bottom: 1px solid var(--editorial-line);
  padding-bottom: 16px;
  font-family: var(--gallery-sans);
}

.details-section-fact dt {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--editorial-ink-faint);
}

.details-section-fact dd {
  margin: 0;
  text-align: right;
  font-family: var(--gallery-serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--editorial-ink);
}

@media (max-width: 639px) {
  .details-section {
    padding: 72px 18px;
  }

  .details-section-fact dd {
    font-size: 17px;
  }
}
```

- [ ] **Step 3: Create `InYourHouseSection`**

`frontend/src/pages/ArtworkPage/sections/InYourHouseSection.tsx`:

```tsx
import type { Artwork } from '@/types/artwork';
import livingRoomImage from '@/assets/living-room-placeholder.jpg';
import './InYourHouseSection.css';

interface InYourHouseSectionProps {
  artwork: Artwork;
}

/**
 * Page 4: composites the painting onto a photographed living-room
 * wall so a visitor can picture it hanging at home, with a purchase
 * link overlaid on the composited painting when the artwork has one.
 * The link is omitted entirely (not shown disabled) when
 * `purchaseUrl` is absent, rather than pointing somewhere generic.
 */
export function InYourHouseSection({ artwork }: InYourHouseSectionProps) {
  return (
    <section className="in-your-house-section" aria-label={`${artwork.title}, in your home`}>
      <div className="in-your-house-frame">
        <img src={livingRoomImage} alt="A living room wall" className="in-your-house-room" />
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}, composited onto the wall`}
          className="in-your-house-painting"
          data-orientation={artwork.orientation}
        />
        {artwork.purchaseUrl && (
          <a
            href={artwork.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="in-your-house-purchase"
          >
            Purchase this piece →
          </a>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Style `InYourHouseSection`**

`frontend/src/pages/ArtworkPage/sections/InYourHouseSection.css`:

```css
.in-your-house-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 24px;
}

.in-your-house-frame {
  position: relative;
  width: 100%;
  max-width: 960px;
}

.in-your-house-room {
  display: block;
  width: 100%;
  height: auto;
}

/* Percentages below assume a mostly-empty wall roughly centered in
   the placeholder photo — retune top/left/width once the real
   living-room photo (Task 1) is in place. */
.in-your-house-painting {
  position: absolute;
  top: 22%;
  left: 50%;
  width: 34%;
  transform: translateX(-50%);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.35);
}

.in-your-house-painting[data-orientation='portrait'] {
  width: 24%;
}

.in-your-house-purchase {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 22px;
  border-radius: 999px;
  background: var(--editorial-paper-bg-raised);
  color: var(--editorial-accent);
  font-family: var(--gallery-sans);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(43, 36, 29, 0.25);
  transition: transform 0.2s ease;
}

.in-your-house-purchase:hover {
  transform: translateX(-50%) translateY(-2px);
}

@media (max-width: 639px) {
  .in-your-house-painting {
    width: 46%;
  }

  .in-your-house-painting[data-orientation='portrait'] {
    width: 34%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .in-your-house-purchase {
    transition: none;
  }
}
```

- [ ] **Step 5: Temporarily mount both to verify**

Temporarily render, in `ArtworkPage.tsx`:

```tsx
return (
  <>
    <DetailsSection artwork={artwork} />
    <InYourHouseSection artwork={artwork} />
  </>
);
```

(with the matching imports added), previewing both new sections before Task 6's real wiring. Don't commit this.

- [ ] **Step 6: Verify**

With `yarn dev` running:
- Open the "Butterflies" artwork (id `"0"`, has `purchaseUrl` from Task 1): confirm the details page shows date/medium/dimensions/category as plain text (no `<details>` toggle), and the "in your house" page shows the painting composited over the room photo with a visible "Purchase this piece →" link.
- Open the "Girl With Pearl Earring" artwork (id `"1"`, no `purchaseUrl`): confirm the "in your house" page shows the composited painting with **no** purchase link at all.

- [ ] **Step 7: Revert the throwaway wiring**

```bash
git checkout -- frontend/src/pages/ArtworkPage/ArtworkPage.tsx
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/ArtworkPage/sections/DetailsSection.tsx frontend/src/pages/ArtworkPage/sections/DetailsSection.css frontend/src/pages/ArtworkPage/sections/InYourHouseSection.tsx frontend/src/pages/ArtworkPage/sections/InYourHouseSection.css
git commit -m "feat(artwork-page): add DetailsSection and InYourHouseSection (pages 3-4)"
```

---

### Task 6: Wire the four sections into `ArtworkPage`

**Files:**
- Modify: `frontend/src/pages/ArtworkPage/ArtworkPage.tsx`
- Modify: `frontend/src/pages/ArtworkPage/ArtworkPage.css`

**Interfaces:**
- Consumes: `HeroSection`, `CollageSection`, `DetailsSection`, `InYourHouseSection` (Tasks 3–5); `Artwork` from `@/types/artwork`.
- Produces: `ArtworkPage({ artwork, onBack, onPrevious, onNext })` — same public signature as before, so `frontend/src/pages/GalleryPage.tsx` requires no changes.

- [ ] **Step 1: Rewrite `ArtworkPage.tsx`**

```tsx
import type { Artwork } from '@/types/artwork';
import { HeroSection } from './sections/HeroSection';
import { CollageSection } from './sections/CollageSection';
import { DetailsSection } from './sections/DetailsSection';
import { InYourHouseSection } from './sections/InYourHouseSection';
import './ArtworkPage.css';

interface ArtworkPageProps {
  artwork: Artwork;
  /** Optional — omit to render without a "back to gallery" link (e.g. in isolation/preview). */
  onBack?: () => void;
  /** Optional prev/next stepping, mirroring ArtworkViewer's controls. Both must be provided together. */
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * Four-part scrollytelling spread for a single artwork: an animated
 * hero, a collage of cropped details + unlabeled text, a full
 * catalogue-facts page, and an "in your house" mockup with a
 * purchase link. The back/stepper controls are a fixed "chrome" bar
 * pinned above all four sections, rather than living inside any one
 * of them, since they need to stay reachable regardless of scroll
 * position.
 */
export function ArtworkPage({ artwork, onBack, onPrevious, onNext }: ArtworkPageProps) {
  const hasStepping = Boolean(onPrevious && onNext);

  return (
    <div className="artwork-page">
      <header className="artwork-page-chrome">
        {onBack ? (
          <button type="button" className="artwork-page-back" onClick={onBack}>
            ← Gallery
          </button>
        ) : (
          <span />
        )}

        {hasStepping && (
          <div className="artwork-page-stepper">
            <button
              type="button"
              className="artwork-page-step-button"
              onClick={onPrevious}
              aria-label="Previous artwork"
            >
              ‹
            </button>
            <button
              type="button"
              className="artwork-page-step-button"
              onClick={onNext}
              aria-label="Next artwork"
            >
              ›
            </button>
          </div>
        )}
      </header>

      <div className="artwork-page-scroller">
        <HeroSection artwork={artwork} />
        <CollageSection artwork={artwork} />
        <DetailsSection artwork={artwork} />
        <InYourHouseSection artwork={artwork} />
      </div>
    </div>
  );
}
```

(The `<span />` placeholder keeps the chrome bar's flex layout balanced — title-less header, so unlike the old header there's nothing to center — when `onBack` is omitted; it renders nothing visible.)

- [ ] **Step 2: Rewrite `ArtworkPage.css`**

```css
.artwork-page {
  position: relative;
  background: var(--editorial-paper-bg);
  color: var(--editorial-ink);
}

.artwork-page-chrome {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(to bottom, var(--editorial-paper-bg) 0%, transparent 100%);
}

.artwork-page-back {
  border: none;
  background: transparent;
  padding: 6px 0;
  font-family: var(--gallery-sans);
  font-style: italic;
  font-size: 13px;
  color: var(--editorial-ink-muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.artwork-page-back:hover {
  color: var(--editorial-ink);
}

.artwork-page-back:focus-visible {
  outline: 1px solid var(--editorial-accent-soft);
  outline-offset: 3px;
}

.artwork-page-stepper {
  display: flex;
  gap: 4px;
}

.artwork-page-step-button {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--editorial-line);
  border-radius: 50%;
  background: var(--editorial-paper-bg-raised);
  color: var(--editorial-ink-soft);
  font-family: var(--gallery-serif);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.artwork-page-step-button:hover {
  border-color: var(--editorial-accent-soft);
  color: var(--editorial-accent);
}

.artwork-page-step-button:focus-visible {
  outline: 1px solid var(--editorial-accent-soft);
  outline-offset: 2px;
}

.artwork-page-scroller {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.artwork-page-scroller > section {
  scroll-snap-align: start;
}

@media (prefers-reduced-motion: reduce) {
  .artwork-page-scroller {
    scroll-snap-type: none;
  }

  .artwork-page-step-button {
    transition: none;
  }
}
```

- [ ] **Step 3: Verify end-to-end**

Run:

```bash
cd frontend && yarn build && yarn dev
```

Expected: `yarn build` succeeds with no TypeScript errors. In the browser, open the gallery, click into an artwork's feature spread, and confirm:
- Scrolling (wheel, trackpad, or touch) steps cleanly through all four full-viewport sections in order, snapping to each.
- The back link (top-left) and prev/next stepper (top-right) stay pinned and usable at every scroll position.
- Clicking prev/next swaps to the adjacent artwork and resets to the top of its hero section.
- Repeat the check at a mobile viewport width (≤639px).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ArtworkPage/ArtworkPage.tsx frontend/src/pages/ArtworkPage/ArtworkPage.css
git commit -m "feat(artwork-page): wire hero/collage/details/in-your-house into a scroll-snap spread"
```
