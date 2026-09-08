import { useMemo, useRef, type CSSProperties } from "react";
import type { Artwork } from "@/types/artwork";
import { formatArtworkDimensions } from "@/utils";
import { useScrollPresentation } from "./useScrollPresentation";
import "./ArtworkOverview.css";

type TransitionPhase = 'idle' | 'focus' | 'isolate' | 'title' | 'ready';
interface ArtworkOverviewProps { artwork: Artwork; transitionPhase?: TransitionPhase; usesSharedArtwork?: boolean }

function DetailCrop({ artwork, index }: { artwork: Artwork; index: number }) {
  return <div className={`overview-crop overview-crop-${index + 1}`}><img className="overview-crop-image" src={artwork.imageUrl} alt=""/></div>;
}

function ArtworkFacts({ artwork }: { artwork: Artwork }) {
  const dimensions = formatArtworkDimensions(artwork.dimensions.width, artwork.dimensions.height, artwork.dimensions.unit);
  return <div className="overview-facts"><p className="overview-technical">{artwork.description.materials}</p><dl className="overview-metadata">
    <div><dt>Year</dt><dd>{artwork.year}</dd></div><div><dt>Dimensions</dt><dd>{dimensions}</dd></div>
    <div><dt>Medium</dt><dd>{artwork.medium}</dd></div><div><dt>Original</dt><dd>One of one</dd></div>
    <div><dt>Signed</dt><dd>{artwork.commerce?.signed ? "By the artist" : "Not specified"}</dd></div>
  </dl></div>;
}

export function ArtworkOverview({ artwork, transitionPhase='ready', usesSharedArtwork=false }: ArtworkOverviewProps) {
  const trackRef = useRef<HTMLElement>(null);
  useScrollPresentation(trackRef, transitionPhase === 'ready');
  const titleWords = useMemo(() => artwork.title.trim().split(/\s+/), [artwork.title]);
  return <section ref={trackRef} className="artwork-presentation-track" data-orientation={artwork.orientation} data-transition-phase={transitionPhase} data-shared-artwork={usesSharedArtwork || undefined} aria-labelledby="artwork-title">
    <div className="artwork-overview">
      <div className="overview-atmosphere" aria-hidden="true"/>
      <div className="overview-intro-meta" aria-hidden="true"><strong>{artwork.artist}</strong><span>{artwork.title}, {artwork.year}</span></div>
      <div className="overview-cinematic-title" aria-hidden="true">{titleWords.map((word,index) => <span className="overview-title-mask" key={`${word}-${index}`} style={{ "--word-index": index } as CSSProperties}><span className="overview-title-word">{word}</span></span>)}</div>
      <figure
        className="overview-main-art"
        style={{ "--artwork-ratio": `${artwork.dimensions.width} / ${artwork.dimensions.height}` } as CSSProperties}
      >{!usesSharedArtwork && <img src={artwork.imageUrl} alt={`${artwork.title} by ${artwork.artist}`}/>}</figure>
      <div className="overview-detail-label" aria-hidden="true"><span>Details</span><i/></div>
      <div className="overview-crops" aria-hidden="true">{[0,1,2,3].map(index => <DetailCrop artwork={artwork} index={index} key={index}/>)}</div>
      <div className="overview-information"><h1 id="artwork-title" className="overview-final-title">{artwork.title}</h1><p className="overview-description">{artwork.description.inspiration}</p><span className="overview-rule" aria-hidden="true"/><ArtworkFacts artwork={artwork}/></div>
      <p className="overview-progress" aria-hidden="true"><span>01</span><i/><span>02</span></p>
    </div>
  </section>;
}
