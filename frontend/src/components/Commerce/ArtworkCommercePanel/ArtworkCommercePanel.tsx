import type { Artwork } from "@/types/artwork";
import { formatPrice } from "@/utils";
import {
  getAcquisitionState,
  getArtworkCurrency,
  getEffectivePrice,
  getOfferDetails,
} from "@/utils/commerce";
import "./ArtworkCommercePanel.css";

export function ArtworkCommercePanel({
  artwork,
  onStartPurchase,
}: {
  artwork: Artwork;
  onStartPurchase: (id: string) => void;
}) {
  const state = getAcquisitionState(artwork);
  const price = getEffectivePrice(artwork);
  const offer = getOfferDetails(artwork);
  if (state === "hidden" || price === null) return null;
  return (
    <div className="commerce-panel">
      <div>
        <p className="commerce-panel-kicker">
          Original artwork · one of a kind
        </p>
        <h3>{artwork.title}</h3>
        <p className="commerce-panel-artist">by {artwork.artist}</p>
      </div>
      <div className="commerce-panel-offer">
        {offer && (
          <span className="commerce-panel-offer-label">{offer.label}</span>
        )}
        <span className="commerce-panel-price">
          {formatPrice(price, getArtworkCurrency(artwork))}
        </span>
        {offer && (
          <span className="commerce-panel-previous">
            Previously{" "}
            {formatPrice(offer.originalPrice, getArtworkCurrency(artwork))}
          </span>
        )}
      </div>
      <div className="commerce-panel-action">
        {state !== "available" && (
          <span className="commerce-panel-state">
            {state === "sold" ? "Private collection" : "Reserved"}
          </span>
        )}
        {state === "available" && (
          <button type="button" onClick={() => onStartPurchase(artwork.id)}>
            Purchase this piece <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
