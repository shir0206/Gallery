import artistPortrait from '@/assets/shir-zabolotny-portrait.webp';
import './AboutPage.css';

interface AboutPageProps { onGallery: () => void; }

export function AboutPage({ onGallery }: AboutPageProps) {
  return (
    <div className="about-page">
      <main className="about-layout">
        <div className="about-portrait">
          <img src={artistPortrait} alt="Portrait of artist Shir Zabolotny" />
          <p>Shir Zabolotny</p>
        </div>
        <article className="about-copy">
          <p className="page-eyebrow">About the artist</p>
          <h1>Shir Zabolotny</h1>
          <p className="about-lede">Shir creates intimate works shaped by observation, memory, and the emotional charge of everyday moments.</p>
          <div className="about-body">
            <p>Moving between pencil, acrylic, colour, and digital media, her practice is grounded in the human figure. Quiet gestures, shifting light, and small moments of connection become starting points for images that feel both personal and open-ended.</p>
            <p>Each work begins with a mood rather than a fixed answer. Layers of texture and colour build a space where vulnerability and strength can sit beside one another, inviting the viewer to bring their own story to the image.</p>
          </div>
          <button type="button" className="text-link" onClick={onGallery}>Explore the gallery →</button>
        </article>
      </main>
    </div>
  );
}
