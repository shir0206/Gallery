import type { Artwork } from '@/types/artwork';
import './EditorialHeader.css';

const SearchIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>;
const HeartIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z"/></svg>;
const BagIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;

interface EditorialHeaderProps {
  artwork?: Artwork;
  onGallery: () => void;
  onAbout: () => void;
  onContact: () => void;
  onCart: () => void;
  cartCount: number;
  onSearch: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isArtworkNavigationDisabled?: boolean;
  isGalleryWall?: boolean;
}

export function EditorialHeader({ artwork, onGallery, onAbout, onContact, onCart, cartCount, onSearch, onPrevious, onNext, isArtworkNavigationDisabled=false, isGalleryWall=false }: EditorialHeaderProps) {
  let isSaved = false;
  try { isSaved = artwork ? window.localStorage.getItem(`shir-gallery:favorites:${artwork.id}`) === 'true' : false; } catch { /* optional storage */ }
  return <header className={`editorial-header${isGalleryWall ? ' editorial-header-gallery-wall' : ''}`}>
    <button type="button" className="editorial-brand" aria-label="Go to gallery" onClick={onGallery}><span>SZ</span><small>Shir Zabolotny<br/>Artworks</small></button>
    <nav className="editorial-primary-nav" aria-label="Primary navigation">
      <button type="button" onClick={onGallery}>Gallery</button>
      <button type="button" onClick={onAbout}>About</button>
      <button type="button" onClick={onContact}>Contact</button>
    </nav>
    <div className="editorial-header-actions">
      {onPrevious&&onNext&&<nav className="editorial-artwork-navigation" aria-label="Browse artworks"><button type="button" onClick={onPrevious} aria-label="Previous artwork" disabled={isArtworkNavigationDisabled}>‹</button><button type="button" onClick={onNext} aria-label="Next artwork" disabled={isArtworkNavigationDisabled}>›</button></nav>}
      <div className="editorial-tools" aria-label="Collection tools"><button type="button" title="Search" aria-label="Search artworks" onClick={onSearch}><SearchIcon/></button><span title="Saved artworks"><HeartIcon/></span><small>({isSaved ? 1 : 0})</small><button type="button" title="Collection bag" aria-label={`Open collection bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} onClick={onCart}><BagIcon/></button><small className="editorial-bag-count">({cartCount})</small></div>
    </div>
  </header>;
}
