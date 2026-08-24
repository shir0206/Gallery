import type { ArtworkApiResponse } from '@/types/artwork';
import { MOCK_ARTWORKS } from './mockArtworkData';

const SIMULATED_LATENCY_MS = 200;

/**
 * Dev fallback used when Firebase isn't configured yet (or is explicitly
 * disabled via VITE_USE_MOCK_API). Returns the same `{ data: Artwork[] }`
 * shape as the real Firestore-backed API, including a small artificial
 * delay so loading states get exercised in development too.
 */
export async function fetchArtworksFromMock(): Promise<ArtworkApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  return { data: MOCK_ARTWORKS };
}
