import { collection, getDocs, query, where } from 'firebase/firestore';
import type { ArtworkApiResponse } from '@/types/artwork';
import { ArtworkApiError } from '../errors';
import { getFirestoreDb } from './firebaseClient';
import { mapDocToArtwork } from './mapArtworkDoc';

const ARTWORKS_COLLECTION = 'artworks';

/**
 * Fetches published artworks from Cloud Firestore and adapts them into
 * the same `{ data: Artwork[] }` shape the mock API returns, so the rest
 * of the app never needs to know which backend is in use.
 *
 * A single malformed document is logged and skipped rather than failing
 * the whole collection; if nothing usable comes back, or the request
 * itself fails, this throws an ArtworkApiError with a message safe to
 * show in the UI.
 */
export async function fetchArtworksFromFirebase(): Promise<ArtworkApiResponse> {
  let db;
  try {
    db = getFirestoreDb();
  } catch (cause) {
    throw new ArtworkApiError(
      'Firebase is not configured. Set VITE_FIREBASE_* environment variables (see .env.example).',
      cause,
    );
  }

  let snapshot;
  try {
    const artworksQuery = query(
      collection(db, ARTWORKS_COLLECTION),
      where('status', '==', 'published'),
    );
    snapshot = await getDocs(artworksQuery);
  } catch (cause) {
    throw new ArtworkApiError('Could not reach the artwork database. Please try again.', cause);
  }

  const data = snapshot.docs.reduce<ArtworkApiResponse['data']>((artworks, doc) => {
    try {
      artworks.push(mapDocToArtwork(doc.id, doc.data()));
    } catch (cause) {
      console.warn(`Skipping malformed artwork document "${doc.id}":`, cause);
    }
    return artworks;
  }, []);

  if (data.length === 0) {
    throw new ArtworkApiError('No published artworks were found.');
  }

  return { data };
}
