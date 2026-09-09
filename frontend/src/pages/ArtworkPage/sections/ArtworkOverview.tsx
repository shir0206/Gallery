import { useMemo, useRef, useState, type CSSProperties } from "react";
import type { Artwork } from "@/types/artwork";
import { formatArtworkDimensions } from "@/utils";
import { useScrollPresentation } from "./useScrollPresentation";
import "./ArtworkOverview.css";

type TransitionPhase = 'idle' | 'focus' | 'isolate' | 'title' | 'ready' | 'closing';
interface ArtworkOverviewProps { artwork: Artwork; transitionPhase?: TransitionPhase; usesSharedArtwork?: boolean; browseDirection?: 'previous' | 'next' | null; onIntroReady?: () => void; isStaticPreview?: boolean }

function orientationFromImage(artwork: Artwork): Artwork['orientation'] {
  if (typeof document === 'undefined') return artwork.orientation;
  const image = Array.from(document.images).find((candidate) =>
    (candidate.currentSrc === artwork.imageUrl || candidate.src === artwork.imageUrl) &&
    candidate.complete && candidate.naturalWidth > 0,
  );
  return image
    ? image.naturalWidth >= image.naturalHeight ? 'landscape' : 'portrait'
    : artwork.orientation;
}

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

export function ArtworkOverview({ artwork, transitionPhase='ready', usesSharedArtwork=false, browseDirection=null, onIntroReady, isStaticPreview=false }: ArtworkOverviewProps) {
  const trackRef = useRef<HTMLElement>(null);
  // When the feature opens from the wall, its source image is already loaded.
  // Read that ratio during the first render so shared-transition geometry does
  // not move after the animation has started. Direct routes fall back to the
  // catalogue value and reconcile when their own image finishes loading.
  const [layoutOrientation, setLayoutOrientation] = useState(() => orientationFromImage(artwork));
  const [layoutShape, setLayoutShape] = useState<'square' | 'oblong'>(() => {
    const ratio = artwork.dimensions.width / Math.max(1, artwork.dimensions.height);
    return ratio >= .88 && ratio <= 1.12 ? 'square' : 'oblong';
  });
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready' | 'error'>(usesSharedArtwork ? 'ready' : 'loading');
  const syncLayoutOrientation = (image: HTMLImageElement) => {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    setLayoutOrientation(ratio >= 1 ? 'landscape' : 'portrait');
    setLayoutShape(ratio >= .88 && ratio <= 1.12 ? 'square' : 'oblong');
  };
  useScrollPresentation(trackRef, transitionPhase === 'ready' && !isStaticPreview);
  const titleWords = useMemo(() => artwork.title.trim().split(/\s+/), [artwork.title]);
  const settleImage = (image: HTMLImageElement) => {
    syncLayoutOrientation(image);
    void image.decode().then(() => { setImageStatus('ready'); onIntroReady?.(); }).catch(() => { setImageStatus('error'); onIntroReady?.(); });
  };
  return <section ref={trackRef} className="artwork-presentation-track" data-orientation={layoutOrientation} data-shape={layoutShape} data-transition-phase={transitionPhase} data-shared-artwork={usesSharedArtwork || undefined} data-image-ready={imageStatus !== 'loading' || undefined} data-image-error={imageStatus === 'error' || undefined} data-browse-direction={browseDirection || undefined} aria-labelledby="artwork-title">
    <div className="artwork-overview">
      <div className="overview-atmosphere" aria-hidden="true"/>
      <div className="overview-intro-meta" aria-hidden="true"><strong>{artwork.artist}</strong><span>{artwork.title}, {artwork.year}</span></div>
      <div className="overview-cinematic-title" aria-hidden="true">{titleWords.map((word,index) => <span className="overview-title-mask" key={`${word}-${index}`} style={{ "--word-index": index } as CSSProperties}><span className="overview-title-word">{word}</span></span>)}</div>
      <p className="overview-scroll-hint"><span>Scroll to explore</span><i aria-hidden="true">↓</i></p>
      <figure
        className="overview-main-art"
        style={{ "--artwork-ratio": `${artwork.dimensions.width} / ${artwork.dimensions.height}` } as CSSProperties}
      >{!usesSharedArtwork && <img src={artwork.imageUrl} alt={`${artwork.title} by ${artwork.artist}`} fetchPriority="high" onLoad={(event) => settleImage(event.currentTarget)} onError={() => { setImageStatus('error'); onIntroReady?.(); }}/>} {imageStatus === 'error' && <span className="overview-image-fallback" role="img" aria-label={`Image unavailable for ${artwork.title}`}>Artwork image unavailable</span>}</figure>
      <div className="overview-detail-label" aria-hidden="true"><span>Details</span><i/></div>
      <div className="overview-crops" aria-hidden="true">{[0,1,2,3].map(index => <DetailCrop artwork={artwork} index={index} key={index}/>)}</div>
      <div className="overview-information"><h1 id="artwork-title" className="overview-final-title">{artwork.title}</h1><p className="overview-description">{artwork.description.inspiration}</p><span className="overview-rule" aria-hidden="true"/><ArtworkFacts artwork={artwork}/></div>
    </div>
  </section>;
}
