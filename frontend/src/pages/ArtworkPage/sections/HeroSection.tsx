import type { Artwork } from '@/types/artwork';
import './HeroSection.css';

interface HeroSectionProps {
  artwork: Artwork;
}

/**
 * Page 1: artist byline, the title framed by a pair of thin rules,
 * and the artwork reproduced at its own aspect ratio and natural
 * pixel size — never cropped, never upscaled — so the first thing a
 * visitor sees is the whole, uncut piece.
 */
export function HeroSection({ artwork }: HeroSectionProps) {
  return (
    <section className="hero-section" aria-label={`${artwork.title}, hero`}>
      <p className="hero-section-artist">{artwork.artist}</p>
      <h1 className="hero-section-title">{artwork.title}</h1>
      <img
        src={artwork.imageUrl}
        alt={`${artwork.title} by ${artwork.artist}`}
        className="hero-section-image"
      />
    </section>
  );
}
