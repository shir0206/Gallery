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
          <p className="about-lede">I create intimate works shaped by observation, memory, and the emotional charge of everyday moments.</p>
          <div className="about-body">
            <p>Moving between pencil, acrylic, colour, and digital media, my practice is grounded in the human figure. Quiet gestures, shifting light, and moments of connection inspire each work. I build texture and colour gradually, allowing vulnerability and strength to sit beside one another and leaving space for viewers to bring their own stories.</p>
            <p>I am a self-taught artist. Courses gave me a foundation, but most of what I know has come from trying things, making mistakes, and following my curiosity. That process taught me how layers interact, how different materials behave, and how unexpected colour combinations can completely change the feeling of a piece.</p>
          </div>
          <button type="button" className="text-link" onClick={onGallery}>Explore the gallery →</button>
        </article>
      </main>
    </div>
  );
}
