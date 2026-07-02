import { Reveal } from "../components/Reveal";
import { trendingTracks } from "../data/content";
import { NavAnchor } from "../lib/navigation";

export function SplitSection() {
  return (
    <section className="section split-section">
      <Reveal>
        <div className="story-card">
          <p className="eyebrow">Import</p>
          <h2>
            Stories that <span className="gradient-text">speak to you.</span>
          </h2>
          <p className="section-sub">
            Bring your existing playlists from Spotify, YouTube, or JioSaavn. OneTune resolves
            metadata and finds playable matches automatically.
          </p>
          <div className="featured-episode">
            <img
              className="featured-thumb"
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=200"
              alt=""
              loading="lazy"
            />
            <div className="featured-info">
              <span className="featured-tag">Featured</span>
              <strong>Import from Spotify</strong>
              <p>Paste a link · instant library</p>
            </div>
            <button type="button" className="featured-play" aria-label="Play preview">
              ▶
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="trending-card">
          <div className="trending-head">
            <h3>Trending now</h3>
            <NavAnchor className="trending-link" href="#vibes">
              Top charts
            </NavAnchor>
          </div>
          <ol className="trending-list">
            {trendingTracks.map((track) => (
              <li key={track.rank}>
                <span className="rank">{track.rank}</span>
                <img className="trend-thumb" src={track.image} alt="" loading="lazy" />
                <div className="trend-meta">
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </div>
                <span className="trend-tag">{track.tag}</span>
              </li>
            ))}
          </ol>
          <NavAnchor className="btn btn-outline full" href="#features">
            Browse categories
          </NavAnchor>
        </div>
      </Reveal>
    </section>
  );
}
