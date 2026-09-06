import type { Artwork } from '@/types/artwork';
import './EditorialHeader.css';

const SearchIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>;
const HeartIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z"/></svg>;
const BagIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;

export function EditorialHeader({ artwork, onPrevious, onNext }: { artwork: Artwork; onPrevious?: () => void; onNext?: () => void }) {
  let isSaved = false;
  try { isSaved = window.localStorage.getItem(`shir-gallery:favorites:${artwork.id}`) === 'true'; } catch { /* optional storage */ }
  return <header className="editorial-header">
    <div className="editorial-brand" aria-label="Shir Zabolotny Artworks"><span>SZ</span><small>Shir Zabolotny<br/>Artworks</small></div>
    <nav className="editorial-primary-nav" aria-label="Primary navigation"><span>Artworks</span><span>About</span><span>Journal</span><span>Contact</span></nav>
    <div className="editorial-header-actions">
      {onPrevious&&onNext&&<nav className="editorial-artwork-navigation" aria-label="Browse artworks"><button type="button" onClick={onPrevious} aria-label="Previous artwork">‹</button><button type="button" onClick={onNext} aria-label="Next artwork">›</button></nav>}
      <div className="editorial-tools" aria-label="Collection tools"><span title="Search"><SearchIcon/></span><span title="Saved artworks"><HeartIcon/></span><small>({isSaved ? 1 : 0})</small><span title="Collection bag"><BagIcon/></span></div>
    </div>
  </header>;
}
