import { useEffect, useRef } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkOverview } from './sections/ArtworkOverview';
import { DetailsSection } from './sections/DetailsSection';
import './ArtworkPage.css';

interface ArtworkPageProps { artwork: Artwork; onBack?: () => void; onPrevious?: () => void; onNext?: () => void; onAddToCart: (artworkId: string) => void; isCovered?: boolean; }

export function ArtworkPage({ artwork, onBack, onPrevious, onNext, onAddToCart, isCovered=false }: ArtworkPageProps) {
  const scrollerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{scrollerRef.current?.scrollTo({top:0,behavior:'auto'})},[artwork.id]);
  useEffect(()=>{if(isCovered)return;const handle=(event:KeyboardEvent)=>{if(event.key==='Escape')onBack?.();else if(event.key==='ArrowLeft')onPrevious?.();else if(event.key==='ArrowRight')onNext?.()};document.addEventListener('keydown',handle);return()=>document.removeEventListener('keydown',handle)},[isCovered,onBack,onPrevious,onNext]);
  return <div className="artwork-page" aria-hidden={isCovered||undefined}><div className="artwork-page-scroller" ref={scrollerRef}><main className="artwork-page-content" key={artwork.id}><ArtworkOverview artwork={artwork}/><DetailsSection artwork={artwork} onAddToCart={onAddToCart}/></main></div></div>;
}
