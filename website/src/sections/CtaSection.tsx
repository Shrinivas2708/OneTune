import { ApkLink } from "../components/ApkLink";
import { Reveal } from "../components/Reveal";
import { siteConfig } from "../config";
import { NavAnchor } from "../lib/navigation";

export function CtaSection() {
  return (
    <section id="download" className="section cta-section">
      <Reveal>
        <div className="cta-card">
          <img className="cta-logo" src="/assets/icon.png" alt="" width={48} height={48} />
          <h2>Ready to vibe?</h2>
          <p>
            Install the APK on your phone, point the app at your API, and start listening. Your
            music stack — finally in one tune.
          </p>
          <div className="cta-actions">
            <ApkLink className="btn btn-primary btn-lg" href="#download">
              Download APK
            </ApkLink>
            <NavAnchor className="btn btn-ghost btn-lg" href="#android">
              How to install
            </NavAnchor>
          </div>
          <p className="cta-note">
            Requires Android 8+. Self-hosted API recommended for full features.
          </p>
          <p className="cta-apk-path">Download link: {siteConfig.apkUrl}</p>
        </div>
      </Reveal>
    </section>
  );
}
