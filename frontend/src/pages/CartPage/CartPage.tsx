import './CartPage.css';
import type { Artwork } from '@/types/artwork';
import { formatArtworkDimensions, formatPrice } from '@/utils';
import { getArtworkCurrency, getEffectivePrice } from '@/utils/commerce';

const BagIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;

interface CartPageProps { artworks: Artwork[]; onGallery: () => void; onRemove: (artworkId: string) => void; onCheckout: (artworkId: string) => void; }

export function CartPage({ artworks, onGallery, onRemove, onCheckout }: CartPageProps) {
  const pricedArtworks = artworks.map((artwork) => ({ artwork, price: getEffectivePrice(artwork) }));
  const currency = artworks[0] ? getArtworkCurrency(artworks[0]) : null;
  const canShowSubtotal = Boolean(currency) && pricedArtworks.every(({ artwork, price }) => price !== null && getArtworkCurrency(artwork) === currency);
  const subtotal = canShowSubtotal ? pricedArtworks.reduce((total, { price }) => total + (price ?? 0), 0) : null;
  const firstArtwork = artworks[0];
  return (
    <div className="cart-page">
      <main className={`cart-content${artworks.length ? ' cart-content-filled' : ''}`} aria-label="Collection bag">
        {artworks.length ? <>
          <p className="cart-eyebrow">Reserved for your consideration</p>
          <h1>Your collection</h1>
          <div className="cart-items">
            {pricedArtworks.map(({ artwork, price }) => <article className="cart-item" key={artwork.id}>
              <img src={artwork.imageUrl} alt={`${artwork.title} by ${artwork.artist}`}/>
              <div className="cart-item-details"><h2>{artwork.title}</h2><p>{artwork.artist} · {artwork.year}</p><small>{artwork.medium} · {formatArtworkDimensions(artwork.dimensions.width, artwork.dimensions.height, artwork.dimensions.unit)}</small><button type="button" onClick={() => onRemove(artwork.id)}>Remove</button></div>
              {price !== null && <strong>{formatPrice(price, getArtworkCurrency(artwork))}</strong>}
            </article>)}
          </div>
          <div className="cart-summary"><span>Subtotal</span><strong>{subtotal !== null && currency ? formatPrice(subtotal, currency) : 'Price on request'}</strong></div>
          <p className="cart-shipping-note">Insured delivery is calculated during checkout.</p>
          <button type="button" className="cart-gallery-link" onClick={() => onCheckout(firstArtwork.id)}>Continue to secure checkout <span aria-hidden="true">→</span></button>
          <button type="button" className="cart-continue-shopping" onClick={onGallery}>← Continue shopping</button>
        </> : <>
        <div className="cart-empty-icon"><BagIcon/></div>
        <p className="cart-eyebrow">Your private collection</p>
        <h1>Your bag is empty</h1>
        <p className="cart-copy">Discover an original artwork and begin a collection of your own.</p>
        <button type="button" className="cart-gallery-link" onClick={onGallery}>Explore the gallery <span aria-hidden="true">→</span></button>
        </>}
      </main>
      <footer className="cart-footer"><span>Original artworks</span><span>Worldwide insured delivery</span><span>Certificate of authenticity</span></footer>
    </div>
  );
}
