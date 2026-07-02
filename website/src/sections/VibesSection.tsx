import { Reveal } from "../components/Reveal";
import { vibes } from "../data/content";
import { NavAnchor } from "../lib/navigation";

export function VibesSection() {
  return (
    <section id="vibes" className="section">
      <Reveal className="section-head row">
        <div>
          <p className="eyebrow">Discover</p>
          <h2>
            Curated for <span className="accent">every vibe</span>
          </h2>
        </div>
        <NavAnchor className="text-link" href="#download">
          View all playlists →
        </NavAnchor>
      </Reveal>
      <div className="vibe-grid">
        {vibes.map((vibe) => (
          <Reveal key={vibe.title} delay={vibe.delay}>
            <article className="vibe-card">
              <div className="vibe-cover">
                <img src={vibe.image} alt="" loading="lazy" />
              </div>
              <div className="vibe-body">
                <h3>{vibe.title}</h3>
                <p>{vibe.description}</p>
                <div className="vibe-meta">
                  <span className="vibe-likes">{vibe.likes}</span>
                  <button type="button" className="vibe-more" aria-label="More options">
                    ⋯
                  </button>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
