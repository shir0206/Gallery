import { useEffect, useState } from "react";
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
	const artworkMatch = matchPath('/artworks/:artworkSlug', location.pathname);
	const featureArtworkSlug = artworkMatch?.params.artworkSlug ?? null;
	const isSearchOpen = location.pathname === '/search';
	const routeState = location.state as { backgroundPath?: string; returnPath?: string } | null;
	const backgroundPath = routeState?.backgroundPath === '/collection' ? '/collection' : '/';
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
	const openArtwork = (artworkId: string) => {
		const artwork = data?.artworks.find((item) => item.id === artworkId);
		if (!artwork) return;
		const currentBackground = location.pathname === '/collection' || (location.pathname === '/search' && backgroundPath === '/collection') ? '/collection' : '/';
		routerNavigate(`/artworks/${artworkSlug(artwork.title)}`, { state: { backgroundPath: currentBackground } });
	};
	const browseArtwork = (artworkId: string | null) => {
		if (!artworkId) return;
		const artwork = data?.artworks.find((item) => item.id === artworkId);
		if (!artwork) return;
		routerNavigate(`/artworks/${artworkSlug(artwork.title)}`, { replace: true, state: { backgroundPath } });
	};
	const openSearch = () => {
		const returnPath = location.pathname;
		routerNavigate('/search', { state: { returnPath, backgroundPath } });
	};
	const closeSearch = () => navigate(routeState?.returnPath || '/');

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

	return (
		<>
			<EditorialHeader
				artwork={featureArtwork}
				onGallery={() => navigate('/')}
				onAbout={() => navigate('/about')}
				onContact={() => navigate('/contact')}
				onCart={() => navigate('/cart')}
				cartCount={cartArtworks.length}
				onSearch={openSearch}
				onPrevious={featureArtwork ? () => browseArtwork(getAdjacentId(data.artworks, featureArtwork.id, 'previous')) : undefined}
				onNext={featureArtwork ? () => browseArtwork(getAdjacentId(data.artworks, featureArtwork.id, 'next')) : undefined}
			/>
			<Routes>
				<Route path="/" element={<Gallery data={data} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered={Boolean(featureArtwork || isPurchaseOpen || isSearchOpen)} />} />
				<Route path="/collection" element={<HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} />} />
				<Route path="/artworks/:artworkSlug" element={backgroundPath === '/collection' ? <HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} /> : <Gallery data={data} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered />} />
				<Route path="/search" element={backgroundPath === '/collection' ? <HomePage artworks={data.artworks} onSelectArtwork={openArtwork} onViewWall={() => navigate('/')} /> : <Gallery data={data} onOpenFeature={openArtwork} onExitWall={() => navigate('/collection')} isCovered />} />
				<Route path="/about" element={<AboutPage onGallery={() => navigate('/')} />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/shipping" element={<PolicyPage variant="shipping" onBack={() => navigate('/cart')} onContact={() => navigate('/contact')} />} />
				<Route path="/returns" element={<PolicyPage variant="returns" onBack={() => navigate('/cart')} onContact={() => navigate('/contact')} />} />
				<Route path="/cart" element={<CartPage artworks={cartArtworks} onGallery={() => navigate('/')} onShipping={() => navigate('/shipping')} onReturns={() => navigate('/returns')} onContact={() => navigate('/contact')} onRemove={(artworkId) => setCartArtworkIds((currentIds) => currentIds.filter((id) => id !== artworkId))} onCheckout={() => setIsPurchaseOpen(true)} />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			{featureArtwork && (
				<ArtworkPage
					artwork={featureArtwork}
					onAddToCart={addToCart}
					isCovered={Boolean(isPurchaseOpen || isSearchOpen)}
					onBack={() => navigate(backgroundPath)}
					onPrevious={() =>
					browseArtwork(
						getAdjacentId(data.artworks, featureArtwork.id, "previous"),
					)
				}
					onNext={() =>
					browseArtwork(
						getAdjacentId(data.artworks, featureArtwork.id, "next"),
						)
					}
				/>
			)}
			{isPurchaseOpen && cartArtworks.length>0 && <PurchaseFlow artworks={cartArtworks} onClose={() => setIsPurchaseOpen(false)} />}
			{isSearchOpen && <ArtworkSearch artworks={data.artworks} onClose={closeSearch} onSelectArtwork={openArtwork} />}
		</>
	);
}
