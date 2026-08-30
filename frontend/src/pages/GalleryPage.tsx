import { useState } from "react";
import { useArtworkCollection } from "@/state/ArtworkCollectionProvider";
import { Gallery } from "@/components/Gallery/Gallery";
import { GalleryStatus } from "@/components/Gallery/GalleryStatus/GalleryStatus";
import { ArtworkPage } from "@/pages/ArtworkPage/ArtworkPage";
import { HomePage } from "@/pages/HomePage/HomePage";
import { getAdjacentId } from "@/utils";

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

	return (
		<>
			{showWallView ? (
				<Gallery
					data={data}
					onOpenFeature={setFeatureArtworkId}
					onExitWall={() => setShowWallView(false)}
					isCovered={Boolean(featureArtwork)}
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
		</>
	);
}
