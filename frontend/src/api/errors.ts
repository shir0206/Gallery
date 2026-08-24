/**
 * Thrown by any artwork data source (Firebase or mock) when a fetch fails
 * or the backend response can't be turned into valid Artwork[] data.
 *
 * UI code can catch this specifically, or just use `.message`, which is
 * always meant to be safe to show to a user.
 */
export class ArtworkApiError extends Error {
  /** The underlying error that triggered this one, if any (e.g. a network or Firestore error). */
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ArtworkApiError';
    this.cause = cause;
  }
}
