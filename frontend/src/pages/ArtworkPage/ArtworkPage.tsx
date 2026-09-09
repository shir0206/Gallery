import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkOverview } from './sections/ArtworkOverview';
import { DetailsSection } from './sections/DetailsSection';
import './ArtworkPage.css';

type TransitionPhase = 'idle' | 'focus' | 'isolate' | 'title' | 'ready' | 'closing';
interface ArtworkPageProps { artwork: Artwork; onBack?: () => void; onScrollBack?: () => void; onPrevious?: () => void; onNext?: () => void; onAddToCart: (artworkId: string) => void; isCovered?: boolean; transitionPhase?: TransitionPhase; usesSharedArtwork?: boolean; browseDirection?: 'previous' | 'next' | null; }

export function ArtworkPage({ artwork, onBack, onScrollBack, onPrevious, onNext, onAddToCart, isCovered=false, transitionPhase='ready', usesSharedArtwork=false, browseDirection=null }: ArtworkPageProps) {
  const scrollerRef=useRef<HTMLDivElement>(null);
  const introTimerRef=useRef<number | null>(null);
  const touchStartYRef=useRef<number | null>(null);
  const isScrollBackRequestedRef=useRef(false);
  const [isIntroLocked,setIsIntroLocked]=useState(!usesSharedArtwork);
  useEffect(()=>{scrollerRef.current?.scrollTo({top:0,behavior:'auto'})},[artwork.id]);
  useEffect(()=>{setIsIntroLocked(!usesSharedArtwork);return()=>{if(introTimerRef.current!==null)window.clearTimeout(introTimerRef.current)}},[artwork.id,usesSharedArtwork]);
  const handleIntroReady=useCallback(()=>{if(usesSharedArtwork)return;if(introTimerRef.current!==null)window.clearTimeout(introTimerRef.current);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setIsIntroLocked(false);return}introTimerRef.current=window.setTimeout(()=>setIsIntroLocked(false),1050)},[usesSharedArtwork]);
  useEffect(()=>{if(isCovered)return;const handle=(event:KeyboardEvent)=>{if(event.key==='Escape')onBack?.();else if(event.key==='ArrowLeft')onPrevious?.();else if(event.key==='ArrowRight')onNext?.()};document.addEventListener('keydown',handle);return()=>document.removeEventListener('keydown',handle)},[isCovered,onBack,onPrevious,onNext]);
  useEffect(()=>{isScrollBackRequestedRef.current=false},[artwork.id]);
  useEffect(()=>{
    const scroller=scrollerRef.current;
    if(!scroller||isCovered||!onScrollBack||transitionPhase!=='ready')return;
    const requestBack=()=>{if(isScrollBackRequestedRef.current)return;isScrollBackRequestedRef.current=true;onScrollBack()};
    const handleWheel=(event:WheelEvent)=>{if(scroller.scrollTop<=1&&event.deltaY<0){event.preventDefault();requestBack()}};
    const handleTouchStart=(event:TouchEvent)=>{touchStartYRef.current=scroller.scrollTop<=1?event.touches[0]?.clientY??null:null};
    const handleTouchMove=(event:TouchEvent)=>{const startY=touchStartYRef.current;const currentY=event.touches[0]?.clientY;if(startY!==null&&currentY!==undefined&&currentY-startY>36){event.preventDefault();requestBack()}};
    const clearTouch=()=>{touchStartYRef.current=null};
    scroller.addEventListener('wheel',handleWheel,{passive:false});
    scroller.addEventListener('touchstart',handleTouchStart,{passive:true});
    scroller.addEventListener('touchmove',handleTouchMove,{passive:false});
    scroller.addEventListener('touchend',clearTouch,{passive:true});
    scroller.addEventListener('touchcancel',clearTouch,{passive:true});
    return()=>{scroller.removeEventListener('wheel',handleWheel);scroller.removeEventListener('touchstart',handleTouchStart);scroller.removeEventListener('touchmove',handleTouchMove);scroller.removeEventListener('touchend',clearTouch);scroller.removeEventListener('touchcancel',clearTouch)};
  },[isCovered,onScrollBack,transitionPhase]);
  return <div className="artwork-page" data-transition-phase={transitionPhase} data-intro-locked={isIntroLocked||undefined} aria-hidden={isCovered||undefined}><div className="artwork-page-scroller" ref={scrollerRef}><main className="artwork-page-content" key={artwork.id} data-browse-direction={browseDirection||undefined}><ArtworkOverview artwork={artwork} transitionPhase={transitionPhase} usesSharedArtwork={usesSharedArtwork} browseDirection={browseDirection} onIntroReady={handleIntroReady}/><DetailsSection artwork={artwork} onAddToCart={onAddToCart}/></main></div></div>;
}
