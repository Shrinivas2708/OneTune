import { Reveal } from "../components/Reveal";
import { siteConfig } from "../config";

const webFeatures = [
  "Listen from any modern browser",
  "Search across YouTube, JioSaavn, and Spotify",
  "Keep your library and playlists in sync",
] as const;

export function WebSection() {
  return (
    <section id="web-version" className="section web-section">
      <Reveal>
        <div className="web-inner">
          <div className="web-copy">
            <p className="eyebrow">Web version</p>
            <h2>
              Your music,
              <br />
              <span className="gradient-text">one tab away.</span>
            </h2>
            <p className="section-sub">
              Prefer a bigger screen? Open OneTune in your browser for a fast, installation-free
              way to search, organize, and play your library from anywhere.
            </p>
            <a className="btn btn-primary btn-lg" href={siteConfig.webUrl}>
              Open web version
            </a>
          </div>
          <div className="web-panel" aria-label="Web version features">
            <div className="browser-bar">
              <span />
              <span />
              <span />
              <div className="browser-address">app.onetune</div>
            </div>
            <div className="web-panel-body">
              <span className="web-panel-kicker">OneTune in your browser</span>
              <strong>Pick up where your music left off.</strong>
              <ul>
                {webFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}