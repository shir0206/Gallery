import { GALLERY_ENVIRONMENT } from '@/api/artworkApi';
import { GalleryBackground } from '../GalleryBackground/GalleryBackground';
import { GalleryLoader } from './GalleryLoader/GalleryLoader';
import './GalleryStatus.css';

interface GalleryStatusProps {
  variant: 'loading' | 'error' | 'empty';
  message: string;
  onRetry?: () => void;
}

/**
 * Shared full-room screen for every non-"here's the art" state:
 * loading, fetch failure, and an empty collection. Rendered against
 * the same GalleryBackground as the loaded gallery so none of these
 * ever feel like a different, cheaper app bolted onto the front of
 * the real one.
 */
export function GalleryStatus({ variant, message, onRetry }: GalleryStatusProps) {
  return (
    <div className="gallery-status">
      <GalleryBackground environment={GALLERY_ENVIRONMENT} />
      <div
        className="gallery-status-content"
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
      >
        {variant === 'loading' && <GalleryLoader />}
        <p className="gallery-status-message">{message}</p>
        {variant === 'error' && onRetry && (
          <button type="button" className="gallery-status-retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
