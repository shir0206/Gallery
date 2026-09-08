import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkOverview } from './sections/ArtworkOverview';
import { DetailsSection } from './sections/DetailsSection';
import './ArtworkPage.css';

type TransitionPhase = 'idle' | 'focus' | 'isolate' | 'title' | 'ready';
interface ArtworkPageProps { artwork: Artwork; onBack?: () => void; onPrevious?: () => void; onNext?: () => void; onAddToCart: (artworkId: string) => void; isCovered?: boolean; transitionPhase?: TransitionPhase; usesSharedArtwork?: boolean; browseDirection?: 'previous' | 'next' | null; }

export function ArtworkPage({ artwork, onBack, onPrevious, onNext, onAddToCart, isCovered=false, transitionPhase='ready', usesSharedArtwork=false, browseDirection=null }: ArtworkPageProps) {
  const scrollerRef=useRef<HTMLDivElement>(null);
  const introTimerRef=useRef<number | null>(null);
  const [isIntroLocked,setIsIntroLocked]=useState(!usesSharedArtwork);
  useEffect(()=>{scrollerRef.current?.scrollTo({top:0,behavior:'auto'})},[artwork.id]);
  useEffect(()=>{setIsIntroLocked(!usesSharedArtwork);return()=>{if(introTimerRef.current!==null)window.clearTimeout(introTimerRef.current)}},[artwork.id,usesSharedArtwork]);
  const handleIntroReady=useCallback(()=>{if(usesSharedArtwork)return;if(introTimerRef.current!==null)window.clearTimeout(introTimerRef.current);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setIsIntroLocked(false);return}introTimerRef.current=window.setTimeout(()=>setIsIntroLocked(false),1050)},[usesSharedArtwork]);
  useEffect(()=>{if(isCovered)return;const handle=(event:KeyboardEvent)=>{if(event.key==='Escape')onBack?.();else if(event.key==='ArrowLeft')onPrevious?.();else if(event.key==='ArrowRight')onNext?.()};document.addEventListener('keydown',handle);return()=>document.removeEventListener('keydown',handle)},[isCovered,onBack,onPrevious,onNext]);
  return <div className="artwork-page" data-transition-phase={transitionPhase} data-intro-locked={isIntroLocked||undefined} aria-hidden={isCovered||undefined}><div className="artwork-page-scroller" ref={scrollerRef}><main className="artwork-page-content" key={artwork.id} data-browse-direction={browseDirection||undefined}><ArtworkOverview artwork={artwork} transitionPhase={transitionPhase} usesSharedArtwork={usesSharedArtwork} browseDirection={browseDirection} onIntroReady={handleIntroReady}/><DetailsSection artwork={artwork} onAddToCart={onAddToCart}/></main></div></div>;
}
