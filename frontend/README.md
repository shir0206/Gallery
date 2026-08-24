# Gallery App — Phase 3: API / Data Layer (Firebase / Cloud Firestore)

A modern interactive digital art gallery, built with React + TypeScript + Vite.

Phase 3 replaces the hardcoded mock data with a proper **data layer**: a
Firestore-backed API with the same mock dataset from earlier phases kept
as an automatic dev fallback, so the UI works identically either way.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase project's config
npm run dev
```

If you leave `.env` empty (or don't create it), the app automatically
falls back to the built-in mock dataset — no Firebase project required
to run it locally.

## Data layer

```
src/api/
  artworkApi.ts               — public entry point: getArtworks(), getArtworkCollection()
  errors.ts                   — ArtworkApiError (safe .message for the UI)
  firebase/
    firebaseClient.ts         — Firebase app + Firestore init from env vars
    firebaseArtworkApi.ts     — fetches + parses the "artworks" Firestore collection
    mapArtworkDoc.ts          — runtime validation: Firestore doc -> Artwork
  mock/
    mockArtworkApi.ts         — simulated-latency mock data source
    mockArtworkData.ts        — the mock dataset itself
```

### `getArtworks(): Promise<Artwork[]>`

The function UI code actually depends on. It:

1. Picks a data source — Firestore if `VITE_FIREBASE_*` env vars are set,
   otherwise the mock dataset (or always mock if `VITE_USE_MOCK_API=true`).
2. Fetches the raw response (shaped as `{ data: [...] }` from both sources).
3. Parses/validates each item into the `Artwork` type, skipping and
   logging any malformed Firestore document rather than failing the
   whole collection.
4. Returns `Artwork[]`, or throws an `ArtworkApiError` with a
   user-safe `.message` on failure.

`getArtworkCollection()` wraps this with the gallery's room/environment
config for the existing UI components — nothing in `components/` or
`pages/` talks to Firebase or the mock data directly.

### Loading & error handling

`GalleryPage` owns the async state: it renders a loading message while
the promise is pending, and the `ArtworkApiError` message (e.g. "Firebase
is not configured...", "Could not reach the artwork database...") if it
rejects. This behavior is identical for both the mock and real API.

### Firestore document shape

Each document in the `artworks` collection is expected to match the
`Artwork` type in `src/types/artwork.ts` (`title`, `artist`, `year`,
`month`, `day`, `medium`, `dimensions`, `category`, `status`,
`description`, `imageUrl`, `orientation`, `palette`). Only documents
with `status == "published"` are queried.

## Folder structure

```
src/
  components/
    Gallery/
      Gallery.tsx                    — top-level composition + selection state
      GalleryBackground.tsx          — environment background image
      GalleryNavigation/
        GalleryNavigation.tsx        — horizontal filmstrip / mini-map
        ArtworkThumbnail.tsx         — single thumbnail in the strip
      ArtworkViewer/
        ArtworkViewer.tsx            — large centered display for the selection
        ArtworkDetails.tsx           — title / artist / description panel
  pages/
    GalleryPage.tsx                  — screen: fetches data, owns loading/error state
  api/                                — data layer (see above)
  types/
    artwork.ts                       — Artwork, GalleryEnvironment, API response types
  assets/                            — images (placeholder for now)
  styles/
    global.css                       — resets + base theme
  utils/
    index.ts                         — shared helpers
  vite-env.d.ts                      — typed import.meta.env for VITE_* vars
  App.tsx
  main.tsx
```

## Component tree (as specified)

```
App
├── Gallery
│   ├── GalleryBackground
│   ├── GalleryNavigation
│   │   └── ArtworkThumbnail
│   └── ArtworkViewer
│       └── ArtworkDetails
```

## What Phase 3 does

- Adds a Firestore-backed artwork data source alongside the mock one,
  behind a single `getArtworks()` entry point.
- Automatically falls back to mock data in dev when Firebase isn't
  configured, so nothing breaks before a real project is wired up.
- Validates each Firestore document at runtime and skips malformed ones
  instead of crashing the whole gallery.
- Surfaces meaningful, user-safe error messages through `ArtworkApiError`.
- Keeps the API implementation fully separate from presentation
  components — nothing under `components/` changed in this phase.

## What Phase 3 deliberately leaves out

- Firebase Auth / write operations — this phase is read-only fetching.
- Pagination or real-time (`onSnapshot`) updates — a single `getDocs()`
  fetch per page load, matching the existing loading/error UX.
- Firestore security rules / indexes config (project-specific, not code).
