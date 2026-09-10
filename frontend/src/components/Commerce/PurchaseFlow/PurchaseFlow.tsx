import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Artwork } from "@/types/artwork";
import { formatPrice } from "@/utils";
import { getArtworkCurrency, getEffectivePrice } from "@/utils/commerce";
import artistPortrait from "@/assets/shir-zabolotny-portrait.webp";
import "./PurchaseFlow.css";

type PurchaseStep = "summary" | "checkout" | "confirmation";
const CalendarIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <rect x="4" y="6" width="24" height="22" rx="2" />
    <path d="M4 12h24M10 3v6M22 3v6M10 17h3M16 17h3M22 17h1M10 22h3M16 22h3" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <rect x="7" y="13" width="18" height="15" rx="2" />
    <path d="M11 13V9a5 5 0 0 1 10 0v4M16 19v4" />
  </svg>
);
const ParcelIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="m4 10 12-6 12 6-12 6-12-6ZM4 10v13l12 6 12-6V10M16 16v13" />
  </svg>
);

export function PurchaseFlow({
  artworks,
  onClose,
}: {
  artworks: Artwork[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const artworksRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<PurchaseStep>("summary");
  const [artworkSlots, setArtworkSlots] = useState(artworks.length);
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
  const formattedTotal =
    total !== null && currency
      ? formatPrice(total, currency)
      : "Price on request";
  const reserveDays = artworks
    .map((artwork) => artwork.commerce?.reservationDays)
    .filter((days): days is number => Boolean(days))
    .sort((a, b) => a - b)[0];
  const delivery = artworks
    .map((artwork) => artwork.commerce?.shipping?.estimatedBusinessDays)
    .find(Boolean);
  const isReservation = Boolean(reserveDays);
  const allInsured =
    artworks.length > 0 &&
    artworks.every((artwork) => artwork.commerce?.shipping?.insured);
  const allWorldwide =
    artworks.length > 0 &&
    artworks.every((artwork) => artwork.commerce?.shipping?.worldwide);

  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button,input,select,a[href],[tabindex]:not([tabindex="-1"])'
        )
      );
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [onClose]);
  useEffect(() => {
    dialogRef.current?.focus();
  }, [step]);
  useLayoutEffect(() => {
    const row = artworksRef.current;
    if (!row) return;
    const updateSlots = () => {
      const styles = getComputedStyle(row);
      const artworkSize =
        parseFloat(styles.getPropertyValue("--purchase-artwork-size")) || 82;
      const gap = parseFloat(styles.columnGap) || 10;
      setArtworkSlots(
        Math.max(1, Math.floor((row.clientWidth + gap) / (artworkSize + gap)))
      );
    };
    updateSlots();
    const observer = new ResizeObserver(updateSlots);
    observer.observe(row);
    return () => observer.disconnect();
  }, [artworks.length, step]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep("confirmation");
  };

  const hasArtworkOverflow = artworks.length > artworkSlots;
  const visibleArtworks = artworks.slice(
    0,
    hasArtworkOverflow ? Math.max(0, artworkSlots - 1) : artworkSlots
  );
  const hiddenArtworkCount = artworks.length - visibleArtworks.length;

  return (
    <div
      className="purchase-flow-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`purchase-flow purchase-flow-${step}`}
        role="dialog"
        aria-modal="true"
        aria-label="Purchase flow"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          type="button"
          className="purchase-flow-close"
          onClick={onClose}
          aria-label="Close purchase window"
        >
          ×
        </button>
        <p className="purchase-flow-step">
          {step === "summary"
            ? "1. Book now"
            : step === "checkout"
            ? "2. Secure checkout"
            : "3. Confirmation"}
        </p>
        {step === "summary" && (
          <>
            <div
              ref={artworksRef}
              className="purchase-flow-artworks"
              aria-label={`${artworks.length} ${
                artworks.length === 1 ? "artwork" : "artworks"
              } in your order`}
            >
              {visibleArtworks.map((artwork) => (
                <img
                  key={artwork.id}
                  src={artwork.imageUrl}
                  alt={`${artwork.title} by ${artwork.artist}`}
                  className="purchase-flow-artwork"
                />
              ))}
              {hasArtworkOverflow && (
                <span
                  className="purchase-flow-artwork-overflow"
                  aria-label={`${hiddenArtworkCount} more ${
                    hiddenArtworkCount === 1 ? "artwork" : "artworks"
                  }`}
                >
                  •••
                </span>
              )}
            </div>
            <p className="purchase-flow-artworks-artist">by Shir Zabolotny</p>
            <div className="purchase-flow-total">
              <span>Total</span>
              <strong>{formattedTotal}</strong>
            </div>
            <div className="purchase-flow-benefits">
              {reserveDays && (
                <div>
                  <span>
                    <CalendarIcon />
                  </span>
                  <p>
                    <strong>Reserve for {reserveDays} days</strong>We’ll hold
                    this piece for you.
                  </p>
                </div>
              )}
              <div>
                <span>
                  <LockIcon />
                </span>
                <p>
                  <strong>Secure &amp; simple</strong>Checkout in minutes.
                </p>
              </div>
              {allInsured && (
                <div>
                  <span>
                    <ParcelIcon />
                  </span>
                  <p>
                    <strong>
                      {allWorldwide ? "Worldwide" : "Careful"} shipping
                    </strong>
                    Carefully packaged and fully insured.
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              className="purchase-flow-primary"
              onClick={() => setStep("checkout")}
            >
              {isReservation ? "Book now" : "Continue"}{" "}
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="purchase-flow-cancel"
              onClick={onClose}
            >
              Learn more
            </button>
          </>
        )}
        {step === "checkout" && (
          <form onSubmit={submit}>
            <div className="purchase-flow-heading-icon">
              <LockIcon />
            </div>
            <h2 id="purchase-flow-title">Secure checkout</h2>
            <p className="purchase-flow-subtitle">
              Your order is secure and encrypted.
            </p>
            <div className="purchase-flow-fields">
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Full name
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
              <fieldset>
                <legend>Shipping address</legend>
                <input
                  aria-label="Address line"
                  name="address"
                  placeholder="Address line"
                  autoComplete="street-address"
                  required
                />
                <div>
                  <input
                    aria-label="City"
                    name="city"
                    placeholder="City"
                    autoComplete="address-level2"
                    required
                  />
                  <input
                    aria-label="Postal code"
                    name="postal"
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    required
                  />
                </div>
                <select
                  aria-label="Country"
                  name="country"
                  autoComplete="country-name"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Country
                  </option>
                  <option>Ireland</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Other</option>
                </select>
              </fieldset>
              <div className="purchase-flow-payment">
                <span aria-hidden="true">▰</span>
                <span>Secure payment details follow</span>
                <strong>VISA</strong>
              </div>
            </div>
            <button type="submit" className="purchase-flow-primary">
              <span aria-hidden="true">▣</span>{" "}
              {isReservation
                ? `Reserve ${formattedTotal}`
                : `Pay ${formattedTotal}`}
            </button>
            <p className="purchase-flow-terms">
              By placing your order, you agree to our <u>terms</u>.
            </p>
          </form>
        )}
        {step === "confirmation" && (
          <>
            <div className="purchase-flow-success" aria-hidden="true">
              ✓
            </div>
            <h2 id="purchase-flow-title">
              Your {artworks.length === 1 ? "piece is" : "pieces are"}
              <br />
              {isReservation ? "reserved!" : "yours!"}
            </h2>
            <p className="purchase-flow-confirmation-copy">
              Thank you! We’ve received your order.
              <br />
              You will receive a confirmation email shortly.
            </p>
            <div className="purchase-flow-next">
              {delivery && (
                <div>
                  <span>
                    <CalendarIcon />
                  </span>
                  <p>
                    <strong>Estimated delivery</strong>
                    {delivery.min}–{delivery.max} business days
                  </p>
                </div>
              )}
              <div>
                <span aria-hidden="true">✉</span>
                <p>
                  <strong>What’s next?</strong>We’ll prepare your artwork with
                  the utmost care.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="purchase-flow-primary"
              onClick={onClose}
            >
              View order
            </button>
            <button
              type="button"
              className="purchase-flow-cancel"
              onClick={onClose}
            >
              Back to collection
            </button>
          </>
        )}
        <div className="purchase-flow-artist-note">
          <img src={artistPortrait} alt="Shir Zabolotny" />
          <p>
            <strong>Thank you for supporting original art.</strong>Every piece
            is created with passion and intention.
          </p>
          <em>Shir Z.</em>
        </div>
      </div>
    </div>
  );
}
