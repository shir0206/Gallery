import "./CartPage.css";
import type { Artwork } from "@/types/artwork";
import { formatArtworkDimensions, formatPrice } from "@/utils";
import { getArtworkCurrency, getEffectivePrice } from "@/utils/commerce";
import { GalleryWallIcon } from "@/components/Gallery/GalleryWallIcon";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 8h14l1 13H4L5 8Z" />
    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10" width="14" height="11" rx="1" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
const DeliveryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 5h12v13H3zM15 10h4l2 3v5h-6z" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
  </svg>
);
interface CartPageProps {
  artworks: Artwork[];
  onGallery: () => void;
  onShipping: () => void;
  onReturns: () => void;
  onContact: () => void;
  onPreview: (artworkId: string) => void;
  onRemove: (artworkId: string) => void;
  onCheckout: () => void;
  animateOnEntry?: boolean;
}

export function CartPage({
  artworks,
  onGallery,
  onShipping,
  onReturns,
  onContact,
  onPreview,
  onRemove,
  onCheckout,
  animateOnEntry = false,
}: CartPageProps) {
  const pricedArtworks = artworks.map((artwork) => ({
    artwork,
    price: getEffectivePrice(artwork),
  }));
  const currency = artworks[0] ? getArtworkCurrency(artworks[0]) : null;
  const canShowTotal =
    Boolean(currency) &&
    pricedArtworks.every(
      ({ artwork, price }) =>
        price !== null && getArtworkCurrency(artwork) === currency
    );
  const total = canShowTotal
    ? pricedArtworks.reduce((sum, { price }) => sum + (price ?? 0), 0)
    : null;
  const totalLabel =
    total !== null && currency
      ? formatPrice(total, currency)
      : "Price on request";

  if (!artworks.length)
    return (
      <div
        className="cart-page cart-page-empty"
        data-returning-from-preview={animateOnEntry || undefined}
      >
        <main className="cart-empty" aria-label="Empty collection bag">
          <div className="cart-empty-icon">
            <BagIcon />
          </div>
          <p className="cart-eyebrow">Your private selection</p>
          <h1>Your bag is empty</h1>
          <p>
            Discover an original artwork and begin a collection of your own.
          </p>
          <button
            type="button"
            className="cart-primary-button"
            onClick={onGallery}
          >
            Explore the gallery <span aria-hidden="true">→</span>
          </button>
        </main>
      </div>
    );

  return (
    <div
      className="cart-page"
      data-returning-from-preview={animateOnEntry || undefined}
    >
      <header className="cart-hero">
        <div className="cart-hero-copy">
          <p className="cart-eyebrow">Your private selection</p>
          <h1>Your collection</h1>
          <p className="cart-intro">Selected works for your collection</p>
        </div>
        <div
          className="cart-hero-art"
          role="img"
          aria-label="A serene gallery interior"
        />
      </header>
      <main className="cart-layout" aria-label="Collection bag">
        <section
          className="cart-items-panel"
          aria-labelledby="cart-items-heading"
        >
          <div className="cart-items-header">
            <h2 id="cart-items-heading">Your items ({artworks.length})</h2>
            <button type="button" className="cart-continue" onClick={onGallery}>
              <GalleryWallIcon /> Continue exploring
            </button>
          </div>
          <div className="cart-items">
            {pricedArtworks.map(({ artwork, price }) => (
              <article className="cart-item" key={artwork.id}>
                <button
                  type="button"
                  className="cart-item-preview"
                  onClick={() => onPreview(artwork.id)}
                  aria-label={`Preview ${artwork.title} by ${artwork.artist}`}
                >
                  <img src={artwork.imageUrl} alt="" />
                </button>
                <div className="cart-item-details">
                  <h3>{artwork.title}</h3>
                  <p>
                    {artwork.artist} · {artwork.year}
                  </p>
                  <small>
                    {artwork.medium}
                    <span aria-hidden="true">•</span>
                    {formatArtworkDimensions(
                      artwork.dimensions.width,
                      artwork.dimensions.height,
                      artwork.dimensions.unit
                    )}
                  </small>
                  <button
                    type="button"
                    onClick={() => onRemove(artwork.id)}
                    aria-label={`Remove ${artwork.title} from your collection`}
                  >
                    Remove
                  </button>
                </div>
                {price !== null && (
                  <strong>
                    {formatPrice(price, getArtworkCurrency(artwork))}
                  </strong>
                )}
              </article>
            ))}
          </div>
        </section>
        <aside
          className="cart-summary-panel"
          aria-labelledby="cart-summary-heading"
        >
          <h2 id="cart-summary-heading">Order summary</h2>
          <p className="cart-count">
            {artworks.length} {artworks.length === 1 ? "artwork" : "artworks"}
          </p>
          <div className="cart-total">
            <span>Collection total</span>
            <strong>{totalLabel}</strong>
            <p>Taxes and delivery calculated at checkout.</p>
          </div>
          <button
            type="button"
            className="cart-primary-button"
            onClick={onCheckout}
          >
            Secure checkout <span aria-hidden="true">→</span>
          </button>
          <div className="cart-reassurances">
            <div>
              <LockIcon />
              <p>
                <strong>Secure payment</strong>
                <span>Your information is protected</span>
              </p>
            </div>
            <div>
              <DeliveryIcon />
              <p>
                <strong>Insured delivery</strong>
                <span>Works arrive safely worldwide</span>
              </p>
            </div>
            <div>
              <HeartIcon />
              <p>
                <strong>A more beautiful world</strong>
                <span>Supporting independent art</span>
              </p>
            </div>
          </div>
          <blockquote>
            “Art turns space into atmosphere.”<cite>— Shir Zabolotny</cite>
          </blockquote>
        </aside>
      </main>
      <footer className="cart-footer">
        <span className="cart-footer-mark">SZ</span>
        <nav aria-label="Footer navigation">
          <button type="button" onClick={onGallery}>
            Artworks
          </button>
          <button type="button" onClick={onShipping}>
            Shipping
          </button>
          <button type="button" onClick={onReturns}>
            Returns
          </button>
          <button type="button" onClick={onContact}>
            Contact
          </button>
        </nav>
        <span>© {new Date().getFullYear()} Shir Zabolotny</span>
      </footer>
      <div className="cart-mobile-checkout">
        <div>
          <span>Collection total</span>
          <strong>{totalLabel}</strong>
        </div>
        <button type="button" onClick={onCheckout}>
          Checkout <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
