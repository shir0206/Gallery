import './SiteHeader.css';

interface SiteHeaderProps {
  active: 'gallery' | 'about' | 'contact';
  onGallery: () => void;
  onAbout: () => void;
  onContact: () => void;
}

export function SiteHeader({ active, onGallery, onAbout, onContact }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button className="site-wordmark" type="button" onClick={onGallery} aria-label="Shir Zabolotny gallery home">
        <span>SZ</span><small>Shir Zabolotny<br />Artworks</small>
      </button>
      <nav className="site-nav" aria-label="Primary navigation">
        <button type="button" className={active === 'gallery' ? 'is-active' : ''} onClick={onGallery}>Gallery</button>
        <button type="button" className={active === 'about' ? 'is-active' : ''} onClick={onAbout}>About</button>
        <button type="button" className={active === 'contact' ? 'is-active' : ''} onClick={onContact}>Contact</button>
      </nav>
    </header>
  );
}
