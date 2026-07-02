import { ApkLink } from "../components/ApkLink";
import { Reveal } from "../components/Reveal";
import { NavAnchor } from "../lib/navigation";

export function HeroSection() {
  return (
    <section className="hero section">
      <Reveal className="hero-copy">
        <p className="eyebrow">Android · Self-hosted · No lock-in</p>
        <h1>
          Meet <span className="accent">OneTune.</span>
          <br />
          Live for sound.
        </h1>
        <p className="lead">
          Search YouTube, JioSaavn, and Spotify in one place. Build your library, import any
          playlist link, download for offline, and keep playback alive on the lock screen — all
          backed by <em>your</em> API.
        </p>
        <div className="hero-actions">
          <ApkLink className="btn btn-primary">
            Download for Android
          </ApkLink>
          <NavAnchor className="btn btn-ghost" href="#features">
            Explore features
          </NavAnchor>
        </div>
        <ul className="hero-stats">
          <li>
            <strong>3</strong>
            <span>providers unified</span>
          </li>
          <li>
            <strong>∞</strong>
            <span>playlists to import</span>
          </li>
          <li>
            <strong>0</strong>
            <span>vendor lock-in</span>
          </li>
        </ul>
      </Reveal>

      <Reveal className="hero-visual delay-1" delay={1}>
        <div className="phone-glow" />
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="app-header">
              <span className="app-greeting">Good evening</span>
              <span className="app-pill">Now playing</span>
            </div>
            <div className="app-artwork">
              <img
                className="app-artwork-img"
                src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400"
                alt="OneTune now playing artwork"
                width={220}
                height={220}
              />
              <div className="artwork-shine" />
            </div>
            <div className="app-meta">
              <h3>Secrets</h3>
              <p>UV Jain · Talha Anjum</p>
            </div>
            <div className="app-progress">
              <div className="app-progress-fill" />
            </div>
            <div className="app-times">
              <span>1:19</span>
              <span>4:38</span>
            </div>
            <div className="app-controls">
              <button type="button" className="ctrl small" aria-label="Previous">
                ⏮
              </button>
              <button type="button" className="ctrl play" aria-label="Play">
                ▶
              </button>
              <button type="button" className="ctrl small" aria-label="Next">
                ⏭
              </button>
            </div>
            <div className="app-tabs">
              <span className="active">Home</span>
              <span>Search</span>
              <span>Library</span>
            </div>
          </div>
        </div>
        <div className="float-card float-card-a">
          <span className="float-icon">♥</span>
          <div>
            <strong>Likes synced</strong>
            <p>Across your library</p>
          </div>
        </div>
        <div className="float-card float-card-b">
          <span className="float-icon green">⬇</span>
          <div>
            <strong>Offline ready</strong>
            <p>Downloads on device</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
