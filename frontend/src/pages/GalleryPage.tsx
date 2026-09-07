import { useState } from "react";
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

type MainView = 'gallery' | 'about' | 'contact' | 'cart';

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
 * Also owns which of the three screens is showing: the immersive
 * museum-wall Gallery (default), the browsable HomePage grid (opened
 * via Gallery's own "Grid view" control, exited via HomePage's "View
 * as gallery wall" link), or the editorial ArtworkPage feature
 * spread (opened from either a grid card or the wall's "Read the
 * feature spread" link). This is plain state rather than a router —
 * three screens isn't yet worth the added dependency. `featureArtworkId`
 * is independent of `showWallView`: opening a feature spread doesn't
 * disturb whichever of grid/wall was showing underneath, so closing
 * it (onBack) returns to exactly that.
 *
 * The feature spread is layered on top of the wall/grid rather than
 * replacing it, so Gallery/HomePage stay mounted (scroll position,
 * selection state) while it's open and reappear instantly on "back"
 * instead of remounting from scratch.
 */
export function GalleryPage() {
	const { data, error, refetch } = useArtworkCollection();
	const [featureArtworkId, setFeatureArtworkId] = useState<string | null>(null);
	const [showWallView, setShowWallView] = useState(true);
	const [purchaseArtworkId, setPurchaseArtworkId] = useState<string | null>(null);
	const [cartArtworkIds, setCartArtworkIds] = useState<string[]>([]);
	const [mainView, setMainView] = useState<MainView>('gallery');
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const navigate = (view: MainView) => {
		setFeatureArtworkId(null);
		setPurchaseArtworkId(null);
		setIsSearchOpen(false);
		setMainView(view);
		window.scrollTo({ top: 0, behavior: 'auto' });
	};

	const retry = () => {
		setFeatureArtworkId(null);
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

	const featureArtwork = featureArtworkId
		? data.artworks.find((artwork) => artwork.id === featureArtworkId)
		: undefined;
	const purchaseArtwork = purchaseArtworkId ? data.artworks.find((artwork) => artwork.id === purchaseArtworkId) : undefined;
	const cartArtworks = cartArtworkIds
		.map((artworkId) => data.artworks.find((artwork) => artwork.id === artworkId))
		.filter((artwork): artwork is (typeof data.artworks)[number] => Boolean(artwork));
	const addToCart = (artworkId: string) => {
		setCartArtworkIds((currentIds) => currentIds.includes(artworkId) ? currentIds : [...currentIds, artworkId]);
		navigate('cart');
	};

	return (
		<>
			<EditorialHeader
				artwork={featureArtwork}
				onGallery={() => navigate('gallery')}
				onAbout={() => navigate('about')}
				onContact={() => navigate('contact')}
				onCart={() => navigate('cart')}
				cartCount={cartArtworks.length}
				onSearch={() => setIsSearchOpen(true)}
				onPrevious={featureArtwork ? () => setFeatureArtworkId(getAdjacentId(data.artworks, featureArtwork.id, 'previous')) : undefined}
				onNext={featureArtwork ? () => setFeatureArtworkId(getAdjacentId(data.artworks, featureArtwork.id, 'next')) : undefined}
			/>
			{mainView === 'about' ? (
				<AboutPage onGallery={() => navigate('gallery')} />
			) : mainView === 'contact' ? (
				<ContactPage />
			) : mainView === 'cart' ? (
				<CartPage artworks={cartArtworks} onGallery={() => navigate('gallery')} onRemove={(artworkId) => setCartArtworkIds((currentIds) => currentIds.filter((id) => id !== artworkId))} onCheckout={(artworkId) => setPurchaseArtworkId(artworkId)} />
			) : showWallView ? (
				<Gallery
					data={data}
					onOpenFeature={setFeatureArtworkId}
					onExitWall={() => setShowWallView(false)}
					isCovered={Boolean(featureArtwork || purchaseArtwork || isSearchOpen)}
				/>
			) : (
				<HomePage
					artworks={data.artworks}
					onSelectArtwork={setFeatureArtworkId}
					onViewWall={() => setShowWallView(true)}
				/>
			)}
			{featureArtwork && (
				<ArtworkPage
					artwork={featureArtwork}
					onAddToCart={addToCart}
					isCovered={Boolean(purchaseArtwork || isSearchOpen)}
					onBack={() => setFeatureArtworkId(null)}
					onPrevious={() =>
						setFeatureArtworkId(
							getAdjacentId(data.artworks, featureArtworkId, "previous"),
						)
					}
					onNext={() =>
						setFeatureArtworkId(
							getAdjacentId(data.artworks, featureArtworkId, "next"),
						)
					}
				/>
			)}
			{purchaseArtwork && <PurchaseFlow artwork={purchaseArtwork} onClose={() => setPurchaseArtworkId(null)} />}
			{isSearchOpen && <ArtworkSearch artworks={data.artworks} onClose={() => setIsSearchOpen(false)} onSelectArtwork={(artworkId) => { setIsSearchOpen(false); setMainView('gallery'); setFeatureArtworkId(artworkId); }} />}
		</>
	);
}
