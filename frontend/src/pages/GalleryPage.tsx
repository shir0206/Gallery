import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useArtworkCollection } from "@/state/ArtworkCollectionProvider";
import { Gallery } from "@/components/Gallery/Gallery";
import { GalleryStatus } from "@/components/Gallery/GalleryStatus/GalleryStatus";
import { ArtworkPage } from "@/pages/ArtworkPage/ArtworkPage";
import { HomePage } from "@/pages/HomePage/HomePage";
import { getAdjacentId } from "@/utils";
import { PurchaseFlow } from '@/components/Commerce/PurchaseFlow/PurchaseFlow';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { ContactPage } from '@/pages/ContactPage/ContactPage';
import { CartPage } from '@/pages/CartPage/CartPage';
import { EditorialHeader } from '@/pages/ArtworkPage/components/EditorialHeader';
import { ArtworkSearch } from '@/pages/ArtworkPage/components/ArtworkSearch';
import { PolicyPage } from '@/pages/PolicyPage/PolicyPage';

function artworkSlug(title: string): string {
	return title
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

type ArtworkTransitionPhase = 'idle' | 'focus' | 'isolate' | 'title' | 'ready' | 'closing';
type BrowseDirection = 'previous' | 'next';

function setGalleryCamera(camera: { x: number; y: number; scale: number }) {
	const root = document.documentElement.style;
	root.setProperty('--gallery-camera-x', `${camera.x}px`);
	root.setProperty('--gallery-camera-y', `${camera.y}px`);
	root.setProperty('--gallery-camera-scale', `${camera.scale}`);
}

/**
 * Top-level screen: reads the artwork collection from the
 * ArtworkCollectionProvider (which owns fetching/caching) and hands
 * it down to the Gallery once it's ready.
 *
 * Loading, fetch failure, and an empty collection are all rendered
 * through GalleryStatus against the same room background as the
 * loaded gallery, rather than a bare/blank screen — so however the
 * fetch goes, it still feels like the same space.
 *
 * Every screen has a route. The immersive gallery wall is `/`, the
 * collection grid is `/collection`, and artwork features are available
 * at `/artworks/:artworkId`. Artwork routes remember whether they were
 * opened over the wall or grid so closing one restores that view.
 *
 * The feature spread is layered on top of the wall/grid rather than
 * replacing it, so Gallery/HomePage stay mounted (scroll position,
 * selection state) while it's open and reappear instantly on "back"
 * instead of remounting from scratch.
 */
export function GalleryPage() {
	const { data, error, refetch } = useArtworkCollection();
	const routerNavigate = useNavigate();
	const location = useLocation();
	const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
	const [cartArtworkIds, setCartArtworkIds] = useState<string[]>([]);
	const [transitionPhase, setTransitionPhase] = useState<ArtworkTransitionPhase>('idle');
	const [transitionArtworkId, setTransitionArtworkId] = useState<string | null>(null);
	const [browseDirection, setBrowseDirection] = useState<BrowseDirection | null>(null);
	const [isBrowseTransitioning, setIsBrowseTransitioning] = useState(false);
	const [hasReturnedToGallery, setHasReturnedToGallery] = useState(false);
	const transitionTimers = useRef<number[]>([]);
	const closeDestinationRef = useRef('/');
	const artworkMatch = matchPath('/artworks/:artworkSlug', location.pathname);
	const featureArtworkSlug = artworkMatch?.params.artworkSlug ?? null;
	const isSearchOpen = location.pathname === '/search';
	const routeState = location.state as { backgroundPath?: string; returnPath?: string; staticPreview?: boolean; animateCartEntry?: boolean } | null;
	const backgroundPath = routeState?.backgroundPath === '/collection' ? '/collection' : '/';
	const hasBackgroundRoute = routeState?.backgroundPath === '/' || routeState?.backgroundPath === '/collection';
	const featureArtwork = featureArtworkSlug
		? data?.artworks.find((artwork) => artworkSlug(artwork.title) === featureArtworkSlug)
		: undefined;

	useEffect(() => {
		if (data && featureArtworkSlug && !featureArtwork) routerNavigate('/', { replace: true });
	}, [data, featureArtwork, featureArtworkSlug, routerNavigate]);

	const navigate = (path: string) => {
		setIsPurchaseOpen(false);
		routerNavigate(path);
		window.scrollTo({ top: 0, behavior: 'auto' });
	};
	const clearTransitionTimers = useCallback(() => {
		transitionTimers.current.forEach(window.clearTimeout);
		transitionTimers.current = [];
	}, []);
	const openArtwork = (artworkId: string, sourceImage?: HTMLImageElement) => {
		const artwork = data?.artworks.find((item) => item.id === artworkId);
		if (!artwork) return;
		const currentBackground = location.pathname === '/collection' || (location.pathname === '/search' && backgroundPath === '/collection') ? '/collection' : '/';
		clearTransitionTimers();
		setBrowseDirection(null);
		setIsBrowseTransitioning(false);
		if (sourceImage && currentBackground === '/') {
			const measured = sourceImage.getBoundingClientRect();
			const wallTrack = sourceImage.closest<HTMLElement>('.artwork-viewer-track');
			document.documentElement.style.setProperty('--wall-scroll-offset', `${-(wallTrack?.scrollLeft ?? 0)}px`);
			const ratio = artwork.dimensions.width / Math.max(1, artwork.dimensions.height);
			const headerHeight = window.innerWidth <= 800 ? 64 : 72;
			const fallbackHeight = Math.min((window.innerHeight - headerHeight) * .6, 620);
			const fallbackWidth = fallbackHeight * ratio;
			const source = measured.width > 20 && measured.height > 20 ? measured : {
				left: (window.innerWidth - fallbackWidth) / 2,
				top: headerHeight + (window.innerHeight - headerHeight - fallbackHeight) / 2,
				width: fallbackWidth,
				height: fallbackHeight,
			};
			const galleryHeight = window.innerHeight - headerHeight;
			const sourceCenterX = source.left + source.width / 2;
			const sourceTopY = source.top - headerHeight;
			const isolateScale = Math.max(2.25, Math.min(3.4, (window.innerWidth * .86) / Math.max(1, source.width)));
			const cameraFor = (scale: number, targetTop: number) => ({
				scale,
				x: window.innerWidth / 2 - sourceCenterX * scale,
				y: targetTop - sourceTopY * scale,
			});
			const isolate = cameraFor(isolateScale, galleryHeight - source.height * isolateScale * .25);

			setGalleryCamera({ x: 0, y: 0, scale: 1 });
			document.documentElement.style.setProperty('--shared-surface-in', '0');
			document.documentElement.style.setProperty('--shared-scroll', '0');
			setTransitionArtworkId(artworkId);
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			setTransitionPhase(reducedMotion ? 'title' : 'focus');
			requestAnimationFrame(() => requestAnimationFrame(() => setGalleryCamera(isolate)));
			if (reducedMotion) transitionTimers.current.push(window.setTimeout(() => setTransitionPhase('ready'), 160));
		} else {
			setTransitionArtworkId(null);
			setTransitionPhase('ready');
		}
		routerNavigate(`/artworks/${artworkSlug(artwork.title)}`, { state: { backgroundPath: currentBackground } });
	};
	const handleCameraSettled = useCallback(() => {
		if (transitionPhase === 'closing') {
			setHasReturnedToGallery(true);
			routerNavigate(closeDestinationRef.current);
			window.scrollTo({ top: 0, behavior: 'auto' });
			return;
		}
		if (transitionPhase !== 'focus') return;
		setTransitionPhase('title');
		const wordCount = Math.max(1, featureArtwork?.title.trim().split(/\s+/).length ?? 1);
		const titleDuration = 610 + (wordCount - 1) * 50;
		transitionTimers.current.push(window.setTimeout(() => setTransitionPhase('ready'), titleDuration));
	}, [transitionPhase, featureArtwork, routerNavigate, backgroundPath]);
	const closeArtworkToGallery = useCallback((destination = backgroundPath) => {
		if (transitionPhase !== 'ready') return;
		closeDestinationRef.current = destination;
		if (backgroundPath !== '/' || destination !== '/' || !transitionArtworkId || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setIsPurchaseOpen(false);
			routerNavigate(destination, destination === '/cart' ? { state: { animateCartEntry: true } } : undefined);
			window.scrollTo({ top: 0, behavior: 'auto' });
			return;
		}
		clearTransitionTimers();
		setTransitionPhase('closing');
		requestAnimationFrame(() => requestAnimationFrame(() => setGalleryCamera({ x: 0, y: 0, scale: 1 })));
	}, [backgroundPath, transitionArtworkId, transitionPhase, clearTransitionTimers, routerNavigate]);
	const browseArtwork = (artworkId: string | null, direction: BrowseDirection) => {
		if (!artworkId || isBrowseTransitioning) return;
		const artwork = data?.artworks.find((item) => item.id === artworkId);
		if (!artwork) return;
		clearTransitionTimers();
		setTransitionArtworkId(null);
		setTransitionPhase('ready');
		setBrowseDirection(direction);
		setIsBrowseTransitioning(true);
		routerNavigate(`/artworks/${artworkSlug(artwork.title)}`, {
			replace: true,
			state: hasBackgroundRoute ? { backgroundPath } : undefined,
		});
		transitionTimers.current.push(window.setTimeout(() => setIsBrowseTransitioning(false), 525));
	};
	useEffect(() => {
		if (!data || !featureArtwork) return;
		(['previous', 'next'] as const).forEach((direction) => {
			const adjacentId = getAdjacentId(data.artworks, featureArtwork.id, direction);
			const adjacent = data.artworks.find((item) => item.id === adjacentId);
			if (adjacent) new Image().src = adjacent.imageUrl;
		});
	}, [data, featureArtwork]);
	const openSearch = () => {
		const returnPath = location.pathname;
		routerNavigate('/search', { state: { returnPath, backgroundPath } });
	};
	const closeSearch = () => navigate(routeState?.returnPath || '/');

	useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);
	useEffect(() => {
		if (featureArtwork) return;
		clearTransitionTimers();
		setTransitionArtworkId(null);
		setTransitionPhase('idle');
		document.documentElement.style.removeProperty('--shared-surface-in');
		document.documentElement.style.removeProperty('--shared-scroll');
		document.documentElement.style.removeProperty('--gallery-camera-x');
		document.documentElement.style.removeProperty('--gallery-camera-y');
		document.documentElement.style.removeProperty('--gallery-camera-scale');
		document.documentElement.style.removeProperty('--wall-scroll-offset');
	}, [featureArtwork, clearTransitionTimers]);

	const retry = () => {
		refetch();
	};

	if (error) {
		return (
			<GalleryStatus
				variant='error'
				message={error}
				onRetry={retry}
			/>
		);
	}

	if (!data) {
		return <GalleryStatus variant='loading' message='Loading gallery...' />;
	}

	if (data.artworks.length === 0) {
		return <GalleryStatus variant='empty' message='No artworks available.' />;
	}

	const cartArtworks = cartArtworkIds
		.map((artworkId) => data.artworks.find((artwork) => artwork.id === artworkId))
		.filter((artwork): artwork is (typeof data.artworks)[number] => Boolean(artwork));
	const addToCart = (artworkId: string) => {
		setCartArtworkIds((currentIds) => currentIds.includes(artworkId) ? currentIds : [...currentIds, artworkId]);
		navigate('/cart');
	};
	const previewCartArtwork = (artworkId: string) => {
		const artwork = data.artworks.find((item) => item.id === artworkId);
		if (!artwork) return;
		clearTransitionTimers();
		setTransitionArtworkId(null);
		setTransitionPhase('ready');
		setBrowseDirection(null);
		routerNavigate(`/artworks/${artworkSlug(artwork.title)}`, { state: { returnPath: '/cart', staticPreview: true } });
	};

	return (
		<>
			<EditorialHeader
				artwork={featureArtwork}
				onGallery={() => featureArtwork ? closeArtworkToGallery('/') : navigate('/')}
				onAbout={() => navigate('/about')}
				onContact={() => navigate('/contact')}
				onCart={() => navigate('/cart')}
				cartCount={cartArtworks.length}
				onSearch={openSearch}
				onPrevious={featureArtwork ? () => browseArtwork(getAdjacentId(data.artworks, featureArtwork.id, 'previous'), 'previous') : undefined}
				onNext={featureArtwork ? () => browseArtwork(getAdjacentId(data.artworks, featureArtwork.id, 'next'), 'next') : undefined}
				isArtworkNavigationDisabled={isBrowseTransitioning}
				isGalleryWall={location.pathname === '/' || transitionPhase === 'closing'}
			/>
			<Routes>
				<Route path="/" element={<Gallery data={data} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered={Boolean(featureArtwork || isPurchaseOpen || isSearchOpen)} transitionArtworkId={transitionArtworkId} transitionPhase={transitionPhase} onCameraSettled={handleCameraSettled} suppressReveal={hasReturnedToGallery} />} />
				<Route path="/collection" element={<HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} />} />
				<Route path="/artworks/:artworkSlug" element={!hasBackgroundRoute ? <div className="direct-artwork-background" aria-hidden="true" /> : backgroundPath === '/collection' ? <HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} /> : <Gallery data={data} focusedArtworkId={featureArtwork?.id} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered transitionArtworkId={transitionArtworkId} transitionPhase={transitionPhase} onCameraSettled={handleCameraSettled} suppressReveal={hasReturnedToGallery} />} />
				<Route path="/search" element={backgroundPath === '/collection' ? <HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} /> : <Gallery data={data} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered />} />
				<Route path="/about" element={<AboutPage onGallery={() => navigate('/')} />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/shipping" element={<PolicyPage variant="shipping" onBack={() => navigate('/cart')} onContact={() => navigate('/contact')} />} />
				<Route path="/returns" element={<PolicyPage variant="returns" onBack={() => navigate('/cart')} onContact={() => navigate('/contact')} />} />
				<Route path="/cart" element={<CartPage artworks={cartArtworks} onGallery={() => navigate('/')} onShipping={() => navigate('/shipping')} onReturns={() => navigate('/returns')} onContact={() => navigate('/contact')} onPreview={previewCartArtwork} onRemove={(artworkId) => setCartArtworkIds((currentIds) => currentIds.filter((id) => id !== artworkId))} onCheckout={() => setIsPurchaseOpen(true)} animateOnEntry={Boolean(routeState?.animateCartEntry)} />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			{featureArtwork && (
				<ArtworkPage
					artwork={featureArtwork}
					onAddToCart={addToCart}
					isCovered={Boolean(isPurchaseOpen || isSearchOpen)}
					transitionPhase={transitionPhase}
					usesSharedArtwork={Boolean(transitionArtworkId)}
					browseDirection={browseDirection}
					isStaticPreview={Boolean(routeState?.staticPreview)}
					onBack={() => routeState?.returnPath === '/cart' ? closeArtworkToGallery('/cart') : navigate(backgroundPath)}
					onScrollBack={() => closeArtworkToGallery(routeState?.returnPath || backgroundPath)}
					onPrevious={() =>
					browseArtwork(
						getAdjacentId(data.artworks, featureArtwork.id, "previous"), "previous",
					)
				}
					onNext={() =>
					browseArtwork(
						getAdjacentId(data.artworks, featureArtwork.id, "next"), "next",
						)
					}
				/>
			)}
			{isPurchaseOpen && cartArtworks.length>0 && <PurchaseFlow artworks={cartArtworks} onClose={() => setIsPurchaseOpen(false)} />}
			{isSearchOpen && <ArtworkSearch artworks={data.artworks} onClose={closeSearch} onSelectArtwork={openArtwork} />}
		</>
	);
}
