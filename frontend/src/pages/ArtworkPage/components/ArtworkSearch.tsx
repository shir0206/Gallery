import { useMemo, useRef, useState, useEffect } from 'react';
import type { Artwork } from '@/types/artwork';
import './ArtworkSearch.css';

interface ArtworkSearchProps {
  artworks: Artwork[];
  onClose: () => void;
  onSelectArtwork: (artworkId: string) => void;
}

function flattenValues(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (typeof value === 'object') return Object.values(value).flatMap(flattenValues);
  return [String(value)];
}

function searchableText(artwork: Artwork): string {
  return flattenValues(artwork).join(' ').toLocaleLowerCase();
}

export function ArtworkSearch({ artworks, onClose, onSelectArtwork }: ArtworkSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(() => artworks.filter((artwork) => {
    const text = searchableText(artwork);
    return terms.every((term) => text.includes(term));
  }), [artworks, query]);

  return <section className="artwork-search" role="dialog" aria-modal="true" aria-labelledby="artwork-search-title">
    <div className="artwork-search-bar">
      <label id="artwork-search-title" htmlFor="artwork-search-input">Search the collection</label>
      <div className="artwork-search-input-wrap">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
        <input ref={inputRef} id="artwork-search-input" type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Title, artist, year, medium, color…" autoComplete="off" />
      </div>
      <button type="button" onClick={onClose} aria-label="Close search">Close</button>
    </div>
    <div className="artwork-search-summary" aria-live="polite">{query.trim() ? `${results.length} ${results.length === 1 ? 'artwork' : 'artworks'} found` : `${artworks.length} artworks`}</div>
    {results.length > 0 ? <div className="artwork-search-grid">
      {results.map((artwork)=><button type="button" className="artwork-search-card" key={artwork.id} onClick={()=>onSelectArtwork(artwork.id)}>
        <span className="artwork-search-image" data-orientation={artwork.orientation}><img src={artwork.imageUrl} alt="" loading="lazy"/></span>
        <strong>{artwork.title}</strong>
        <small>{artwork.artist} · {artwork.year} · {artwork.medium}</small>
      </button>)}
    </div> : <p className="artwork-search-empty">No artworks match “{query.trim()}”. Try a title, artist, year, medium, category, or a word from the description.</p>}
  </section>;
}
