import { useRef } from "react";
import type { Artwork } from "@/types/artwork";
import { ArtworkThumbnail } from "./ArtworkThumbnail/ArtworkThumbnail";
import { NavWindow } from "./NavWindow/NavWindow";
import "./GalleryNavigation.css";

interface GalleryNavigationProps {
	artworks: Artwork[];
	selectedArtworkId: string | null;
	/** Which artworks are currently hanging on the wall (reported by
	 * ArtworkViewer's own IntersectionObserver), as opposed to just the
	 * single active `selectedArtworkId`. Drives thumbnail opacity — a
	 * thumbnail is "lit" when its artwork is in this set, regardless of
	 * whether the thumbnail itself is scrolled into view within the
	 * strip. */
	visibleArtworkIds: Set<string>;
	onSelectArtwork: (artworkId: string) => void;
}

/**
 * Horizontal filmstrip / mini-map of the entire collection.
 *
 * The strip itself is static — every thumbnail sits fixed at its
 * layout position, no panning or scrolling of the strip. Browsing the
 * collection happens entirely through the draggable `NavWindow`
 * overlay: a minimap-style viewport frame the visitor moves via drag,
 * wheel/trackpad scroll, or an eased glide when the selection changes
 * elsewhere (a thumbnail click, previous/next, arrow keys, or the
 * visitor scrolling the main wall).
 *
 * Thumbnail opacity comes straight from `visibleArtworkIds` — which
 * artworks are actually hanging on the wall above right now — not
 * from anything about the window's position. Moving the window to
 * browse the full collection never changes which thumbnails are lit.
 */
export function GalleryNavigation({
	artworks,
	selectedArtworkId,
	visibleArtworkIds,
	onSelectArtwork,
}: GalleryNavigationProps) {
	const stripRef = useRef<HTMLDivElement>(null);

	return (
		<nav className='gallery-navigation' aria-label='Artwork collection'>
			<div className='gallery-navigation-card'>
				<div ref={stripRef} className='gallery-navigation-strip'>
					{artworks.map((artwork) => {
						const isActive = artwork.id === selectedArtworkId;
						return (
							<ArtworkThumbnail
								key={artwork.id}
								artwork={artwork}
								isActive={isActive}
								isVisible={visibleArtworkIds.has(artwork.id)}
								onSelect={onSelectArtwork}
							/>
						);
					})}
					<NavWindow
						trackRef={stripRef}
						artworks={artworks}
						selectedArtworkId={selectedArtworkId}
						onSelectArtwork={onSelectArtwork}
					/>
				</div>
			</div>
		</nav>
	);
}
