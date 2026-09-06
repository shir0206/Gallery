import type { Artwork } from '@/types/artwork';
import { formatPrice } from '@/utils';
import { getAcquisitionState, getArtworkCurrency, getEffectivePrice, getOfferDetails } from '@/utils/commerce';
import { ConfidenceStrip } from '@/components/Commerce/ConfidenceStrip/ConfidenceStrip';
import livingRoomPlaceholder from '@/assets/living-room-placeholder.jpg';
import livingRoomP1 from '@/assets/livingroom-p1.png';
import livingRoomP2 from '@/assets/livingroom-p2.png';
import livingRoomP3 from '@/assets/livingroom-p3.png';
import livingRoomP4 from '@/assets/livingroom-p4.png';
import './DetailsSection.css';

interface DetailsSectionProps { artwork: Artwork; onStartPurchase: (artworkId: string) => void; }
const PALETTE_ROOM_IMAGES:Record<string,string>={P1:livingRoomP1,P2:livingRoomP2,P3:livingRoomP3,P4:livingRoomP4};

export function DetailsSection({ artwork, onStartPurchase }: DetailsSectionProps) {
  const roomKey=artwork.palette.id in PALETTE_ROOM_IMAGES?artwork.palette.id.toLowerCase():undefined;
  const price=getEffectivePrice(artwork); const offer=getOfferDetails(artwork); const state=getAcquisitionState(artwork);
  const currency=getArtworkCurrency(artwork); const canPurchase=state==='available'; const showCommerce=state!=='hidden'&&price!==null;
  return <section className="details-section" aria-labelledby="acquisition-title">
    <div className="acquisition-layout">
      <div className="in-your-house-frame" data-room={roomKey}>
        <img src={artwork.interiorImageUrl??PALETTE_ROOM_IMAGES[artwork.palette.id]??livingRoomPlaceholder} alt={`A curated living room featuring ${artwork.title}`} className="in-your-house-room"/>
        <div className="room-caption" aria-hidden="true">A piece<br/>of a quieter<br/>world.<span/></div>
        <img src={artwork.imageUrl} alt="" className="in-your-house-painting" data-orientation={artwork.orientation}/>
        <p className="room-scale-note">Shown in a residential setting for scale and inspiration.</p>
      </div>
      <div className="acquisition-panel">
        <h2 id="acquisition-title">Bring this artwork<br/>into your home.</h2><span className="acquisition-rule" aria-hidden="true"/>
        {showCommerce&&<div className="acquisition-offer">
          {offer&&<div className="acquisition-offer-top"><span className="acquisition-old-price">{formatPrice(offer.originalPrice,currency)}</span><span className="acquisition-sale">Sale</span></div>}
          <strong>{formatPrice(price,currency)}</strong>
          {canPurchase?<button type="button" onClick={()=>onStartPurchase(artwork.id)}><span>Add to collection</span><span aria-hidden="true">→</span></button>:<p className="acquisition-status">{state==='sold'?'Private collection':'Reserved'}</p>}
        </div>}
        <ConfidenceStrip artwork={artwork}/>
      </div>
    </div>
  </section>;
}
