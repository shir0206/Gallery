import type { Artwork, ArtworkApiResponse, ArtworkCollectionResponse } from '@/types/artwork';
import { isFirebaseConfigured } from './firebase/firebaseClient';
import { fetchArtworksFromFirebase } from './firebase/firebaseArtworkApi';
import { fetchArtworksFromMock } from './mock/mockArtworkApi';

export { ArtworkApiError } from './errors';

/**
 * Picks the data source:
 * - VITE_USE_MOCK_API=true always forces the mock dataset (handy for
 *   local dev/demos even with a Firebase project configured).
 * - Otherwise: use Firestore if it's configured, and fall back to the
 *   mock dataset if it isn't, so the app runs out of the box before a
 *   Firebase project is wired up.
 */
function shouldUseMock(): boolean {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') return true;
  return !isFirebaseConfigured();
}

/**
 * Fetches the artwork collection, parses it, and returns `Artwork[]`.
 * This is the only function UI code needs for artwork data — it behaves
 * identically whether it's backed by Firestore or the local mock data,
 * and throws an ArtworkApiError (safe `.message` to show users) on failure.
 */
export async function getArtworks(): Promise<Artwork[]> {
  const response: ArtworkApiResponse = shouldUseMock()
    ? await fetchArtworksFromMock()
    : await fetchArtworksFromFirebase();

  return response.data;
}

/**
 * Fetches the artwork collection and adapts it into the shape the
 * gallery UI consumes (adding the room/environment config, which lives
 * outside the artwork API itself).
 */
export async function getArtworkCollection(): Promise<ArtworkCollectionResponse> {
  const artworks = await getArtworks();

  return {
    environment: {
      name: 'Main Hall',
      backgroundImageUrl: '/src/assets/gallery-background-placeholder.jpg',
    },
    artworks,
  };
}
