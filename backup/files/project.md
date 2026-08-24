# Gallery Project — Phased AI Build Specification

## Project Overview

Build a modern interactive digital art gallery using **React + TypeScript**.

The gallery is a 3D/visual experience where:

- The gallery room uses an image as its background/environment.
- Artwork data is loaded from an API.
- The API returns JSON containing artwork metadata.
- A horizontal artwork navigation strip acts like a **mini map / filmstrip** of the collection.
- Clicking an artwork opens it as the main selected piece.
- Users can also scroll through the artwork strip to navigate between pieces.
- Each selected artwork has its own detailed presentation screen.

The visual direction should be inspired by the provided gallery reference image: a clean museum-like environment, large artwork displayed prominently, subtle navigation at the bottom, and a premium editorial/art-gallery feeling.

---

# Phase 1 — Project Foundation

## Goal

Create the basic React + TypeScript application structure.

## Requirements

- Use React.
- Use TypeScript.
- Use a clean component-based architecture.
- Use a modern build setup such as Vite.
- Create a clear folder structure for:

  - components
  - pages/screens
  - API/data
  - types
  - assets
  - styles
  - utilities

## Initial Components

Create the following conceptual components:

```text
App
├── Gallery
│   ├── GalleryBackground
│   ├── GalleryNavigation
│   │   └── ArtworkThumbnail
│   └── ArtworkViewer
│       └── ArtworkDetails
```

Do not over-engineer the architecture yet.

The goal of this phase is only to establish the application foundation and render a basic gallery shell.

---

# Phase 2 — Artwork Data Model

## Goal

Create the TypeScript types for the artwork data.

The API returns objects in this structure:

```json
{
  "data": [
    {
      "id": "0",
      "title": "Butterflies",
      "artist": "Shir Zabolotny",
      "year": 2011,
      "month": 1,
      "day": 22,
      "medium": "Photoshop",
      "dimensions": {
        "width": 21,
        "height": 29.7,
        "unit": "cm"
      },
      "category": ["Photoshop", "Woman", "Butterflies", "Color"],
      "status": "published",
      "description": {
        "materials": "Painted silhouette with rough blue, ochre, green, and yellow pigment on a textured ground.",
        "visual": "Deep blue, mossy green, and glowing yellow contrast the figure with the light behind it.",
        "inspiration": "A person steps into the night carrying private hope that darkness cannot quite swallow."
      },
      "imageUrl": "https://i.imgur.com/c2PPnGg.jpg",
      "orientation": "portrait",
      "palette": {
        "id": "P1",
        "name": "Midnight & Gold"
      }
    }
  ]
}
```

Create TypeScript interfaces/types for:

- `Artwork`
- `ArtworkDimensions`
- `ArtworkDescription`
- `ArtworkPalette`
- API response

For example:

```ts
interface Artwork {
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
  orientation: "portrait" | "landscape";
  palette: ArtworkPalette;
}
```

Keep the types reusable throughout the application.

---

# Phase 3 — API / Data Layer - FIREBASE (Cloud Firestore)

## Goal

Create the data-fetching layer.

The artwork collection should **not be hardcoded inside the UI components**.

Create a dedicated API/data layer responsible for retrieving the artwork JSON from the backend.

Example conceptual API:

```ts
getArtworks(): Promise<Artwork[]>
```

The API response has the structure:

```json
{
  "data": []
}
```

The API layer should:

1. Fetch the data.
2. Parse the response.
3. Return `Artwork[]`.
4. Handle loading.
5. Handle errors.
6. Keep API implementation separate from presentation components.

For development, if the real backend endpoint is not available yet, create a mock API implementation using the provided JSON.

The UI should behave exactly the same whether the data comes from the mock API or the real API.

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId: import.meta.env.VITE_FIREBASE_APP_ID,
measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

---

# Phase 4 — Gallery Environment

## Goal

Create the main gallery environment.

The gallery should use a **background image** that visually represents the museum/gallery wall.

The background should:

- Fill the viewport.
- Preserve its visual proportions.
- Cover the screen without distortion.
- Remain behind the artwork.
- Create the feeling that the artwork is physically displayed inside the gallery.

Use CSS/background-image or an equivalent implementation.

Structure:

```text
Gallery
├── Background
├── Main Artwork
└── Artwork Navigation
```

The background should be independent from the artwork content.

This allows the gallery environment to be replaced later without changing the artwork components.

---

# Phase 5 — Artwork Navigation / Mini Map

## Goal

Build the horizontal artwork navigation shown at the bottom of the gallery.

This component is effectively a **mini map of the entire collection**.

It displays small thumbnails of all available artworks.

Example:

```text
[img] [img] [img] [img] [img] [img] [img] [img] ...
```

## Behavior

The navigation must support:

### Horizontal scrolling

The user can scroll through the collection.

The navigation should work well with:

- mouse
- trackpad
- touch
- mobile horizontal gestures

### Clicking a thumbnail

When the user clicks a thumbnail:

```text
thumbnail click
      ↓
selectedArtwork changes
      ↓
main artwork updates
```

### Active artwork

The currently selected artwork must be visually distinguishable.

For example:

- slightly larger thumbnail
- border
- opacity change
- subtle highlight
- scale animation

Do not make the active state visually heavy.

The navigation should feel like a **museum artwork index**, not a traditional website carousel.

---

# Phase 6 — Main Artwork Viewer

## Goal

Create the main artwork display.

The selected artwork should be displayed prominently in the center of the gallery.

Conceptually:

```text
┌───────────────────────────────────────┐
│                                       │
│                                       │
│             ARTWORK                   │
│                                       │
│                                       │
│                                       │
└───────────────────────────────────────┘

       [ artwork navigation ]
```

The image should respect its original orientation.

Portrait artworks should remain portrait.

Landscape artworks should remain landscape.

Do not crop artwork unnecessarily.

The viewer should dynamically render the currently selected artwork.

---

# Phase 7 — Artwork / Piece Screen

## Goal

Create the detailed artwork presentation.

When the user selects an artwork, the application should render a dedicated **Piece view**.

The Piece view contains:

### Artwork

Large presentation of the artwork.

### Title

Example:

```text
Butterflies
```

### Artist

Example:

```text
Shir Zabolotny
```

### Date

Combine:

```text
22 January 2011
```

### Medium

Example:

```text
Photoshop
```

### Dimensions

Example:

```text
21 × 29.7 cm
```

### Categories

Display the artwork categories:

```text
Photoshop
Woman
Butterflies
Color
```

### Description

The description contains three conceptual sections:

```text
Materials
Visual
Inspiration
```

These should be presented as structured metadata rather than one large paragraph.

---

# Phase 8 — Navigation Between Pieces

## Goal

Allow users to move naturally between artworks.

The selected artwork should be controlled by a single piece of state:

```ts
selectedArtwork;
```

Navigation should support:

### Thumbnail click

```text
click thumbnail
→ select artwork
→ update Piece
```

### Previous artwork

Allow moving to the previous artwork.

### Next artwork

Allow moving to the next artwork.

### Horizontal navigation

Scrolling the artwork mini map should not necessarily change the selected artwork unless the user explicitly selects an artwork.

The navigation strip represents the collection, while selection represents the current piece.

---

# Phase 9 — Transitions

## Goal

Make switching between artworks feel intentional and premium.

When changing artwork:

```text
Artwork A
   ↓
transition
   ↓
Artwork B
```

Use subtle transitions.

Possible effects:

- fade
- opacity
- slight scale
- slide
- image crossfade

Avoid excessive animation.

The experience should feel closer to an **interactive museum exhibition** than a standard website carousel.

---

# Phase 10 — Responsive Behavior

## Goal

Make the gallery work across screen sizes.

Support:

- desktop
- laptop
- tablet
- mobile

### Desktop

Prioritize:

- large artwork
- spacious gallery environment
- horizontal mini-map at the bottom
- artwork metadata around or below the artwork

### Mobile

The layout should adapt rather than simply shrink.

The artwork should remain the primary focus.

The thumbnail navigation should become a touch-friendly horizontal scroll.

Artwork metadata should be reorganized vertically.

Avoid horizontal page overflow.

---

# Phase 11 — Visual Design

## Goal

Match the visual feeling of the provided reference.

The design should feel:

- artistic
- sophisticated
- editorial
- modern
- minimal
- museum-like
- premium

Avoid:

- generic dashboard UI
- heavy cards
- excessive borders
- overly bright colors
- unnecessary buttons
- standard SaaS styling

The artwork should always be the visual focus.

The UI should feel like it belongs inside an art gallery.

---

# Phase 12 — Loading & Error States

## Goal

Handle API states gracefully.

Implement:

### Loading

While artworks are loading:

```text
Loading gallery...
```

Prefer a visually appropriate gallery loader rather than a generic spinner.

### Error

If the API fails:

```text
Unable to load the gallery.
```

Provide a retry action.

### Empty state

If the API returns no artworks:

```text
No artworks available.
```

---

# Phase 13 — Accessibility

## Goal

Make the gallery usable with keyboard and assistive technologies.

Requirements:

- Artwork thumbnails must be keyboard accessible.
- Images should have meaningful `alt` text.
- Buttons must have accessible labels.
- Selected artwork should have an accessible selected state.
- Keyboard users should be able to navigate between artworks.
- Do not rely only on color to indicate the selected artwork.

---

# Phase 14 — Final Architecture

The final conceptual architecture should look approximately like:

```text
src/
│
├── api/
│   └── artworks.ts
│
├── components/
│   ├── Gallery/
│   │   ├── Gallery.tsx
│   │   ├── GalleryBackground.tsx
│   │   ├── ArtworkViewer.tsx
│   │   ├── ArtworkNavigation.tsx
│   │   └── ArtworkThumbnail.tsx
│   │
│   └── Piece/
│       ├── Piece.tsx
│       ├── ArtworkImage.tsx
│       ├── ArtworkMetadata.tsx
│       └── ArtworkDescription.tsx
│
├── types/
│   └── artwork.ts
│
├── hooks/
│   └── useArtworks.ts
│
├── data/
│   └── mockArtworks.ts
│
├── assets/
│   └── gallery-background.*
│
├── styles/
│   └── ...
│
├── App.tsx
└── main.tsx
```

---

# Implementation Order

Build the project incrementally in this exact order:

1. **Project foundation**
2. **TypeScript artwork types**
3. **Mock/API data layer**
4. **Gallery background**
5. **Main artwork viewer**
6. **Thumbnail mini-map**
7. **Artwork selection state**
8. **Piece details**
9. **Previous/next navigation**
10. **Transitions**
11. **Responsive layout**
12. **Loading/error states**
13. **Accessibility**
14. **Final visual polish**

Do not implement everything in one step.

Each phase should leave the application in a working state before moving to the next phase.

---

# Important Architecture Rule

The artwork data should flow in one direction:

```text
API
 ↓
Artwork data
 ↓
Gallery state
 ↓
Selected artwork
 ↓
Piece / Viewer
```

Avoid putting API calls directly inside individual visual components.

The visual components should receive artwork data through props/state and should not care where the data came from.

---

# Final User Experience

The final experience should feel like this:

```text
                GALLERY
        ┌─────────────────────┐
        │                     │
        │      ARTWORK        │
        │                     │
        │                     │
        └─────────────────────┘


  [thumbnail] [thumbnail] [SELECTED] [thumbnail] [thumbnail]
              ← horizontal scroll →
```

The user can:

1. Enter the gallery.
2. See the currently selected artwork.
3. See a small collection map at the bottom.
4. Scroll through the collection.
5. Click any artwork.
6. See that artwork become the main piece.
7. Open/view its detailed information.
8. Move naturally to previous/next artworks.
9. Experience the whole collection as an interactive digital exhibition.
