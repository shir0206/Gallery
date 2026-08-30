import { GalleryPage } from '@/pages/GalleryPage';
import { ArtworkCollectionProvider } from '@/state/ArtworkCollectionProvider';

function App() {
  return (
    <ArtworkCollectionProvider>
      <GalleryPage />
    </ArtworkCollectionProvider>
  );
}

export default App;
