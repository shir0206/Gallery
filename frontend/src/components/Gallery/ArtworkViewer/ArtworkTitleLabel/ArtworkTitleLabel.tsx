import type { Artwork } from "@/types/artwork";
import "./ArtworkTitleLabel.css";

interface ArtworkTitleLabelProps {
  artwork: Artwork;
}

export function ArtworkTitleLabel({ artwork }: ArtworkTitleLabelProps) {
  return <p className="artwork-title-label">{artwork.title}</p>;
}
