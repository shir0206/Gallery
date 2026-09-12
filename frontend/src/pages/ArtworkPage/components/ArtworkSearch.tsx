import { useMemo, useRef, useState, useEffect } from "react";
import { ArtworkSearchGrid } from "@/components/ArtworkSearchGrid/ArtworkSearchGrid";
import type { Artwork } from "@/types/artwork";
import "./ArtworkSearch.css";

interface ArtworkSearchProps {
  artworks: Artwork[];
  onClose: () => void;
  onSelectArtwork: (artworkId: string) => void;
}

function flattenValues(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (typeof value === "object")
    return Object.values(value).flatMap(flattenValues);
  return [String(value)];
}

function searchableText(artwork: Artwork): string {
  return flattenValues(artwork).join(" ").toLocaleLowerCase();
}

const SEARCH_SUGGESTIONS = ["Pencil", "Acrylic", "2010", "Portraits"];

export function ArtworkSearch({
  artworks,
  onClose,
  onSelectArtwork,
}: ArtworkSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const terms = useMemo(
    () => query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );
  const results = useMemo(
    () =>
      artworks
        .map((artwork, index) => {
          const text = searchableText(artwork);
          const title = artwork.title.toLocaleLowerCase();
          const matches = terms.every((term) => text.includes(term));
          const titleMatches = terms.filter((term) =>
            title.includes(term)
          ).length;
          return { artwork, index, matches, titleMatches };
        })
        .filter(({ matches }) => matches)
        .sort((a, b) => b.titleMatches - a.titleMatches || a.index - b.index)
        .map(({ artwork }) => artwork),
    [artworks, terms]
  );

  const trimmedQuery = query.trim();
  const handleClearOrClose = () => {
    if (trimmedQuery) {
      setQuery("");
      inputRef.current?.focus();
    } else {
      onClose();
    }
  };

  return (
    <section
      className="artwork-search"
      role="dialog"
      aria-modal="true"
      aria-label="Search artworks"
    >
      <div className="artwork-search-bar">
        <div className="artwork-search-input-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <input
            ref={inputRef}
            id="artwork-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artworks…"
            aria-label="Search artworks by title, medium, year, or keyword"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleClearOrClose}
            aria-label={trimmedQuery ? "Clear search" : "Close search"}
            title={trimmedQuery ? "Clear search" : "Close search"}
          >
            ×
          </button>
        </div>
      </div>
      {trimmedQuery ? (
        <div className="artwork-search-summary" aria-live="polite">
          {results.length} {results.length === 1 ? "artwork" : "artworks"}{" "}
          matching <span>“{trimmedQuery}”</span>
        </div>
      ) : (
        <div className="artwork-search-intro">
          <h2>Search artworks</h2>
          <p>Try a title, medium, year, or subject</p>
          <div
            className="artwork-search-suggestions"
            aria-label="Suggested searches"
          >
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      {results.length > 0 ? (
        <ArtworkSearchGrid
          artworks={results}
          onSelectArtwork={onSelectArtwork}
        />
      ) : (
        <p className="artwork-search-empty">
          No artworks match “{trimmedQuery}”.
          <br />
          Try a title, medium, year, or subject.
        </p>
      )}
    </section>
  );
}
