import { ApkLink } from "../components/ApkLink";
import { NavAnchor } from "../lib/navigation";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <NavAnchor href="#top" className="footer-logo">
              <img src="/assets/icon.png" alt="" width={36} height={36} />
              <span>OneTune</span>
            </NavAnchor>
            <p>Your music. Your stack. One tune.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <NavAnchor href="#features">Features</NavAnchor>
              <NavAnchor href="#vibes">Discover</NavAnchor>
              <ApkLink href="#download">Download APK</ApkLink>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <NavAnchor href="#android">Android app</NavAnchor>
              <ApkLink href="#download">Direct install</ApkLink>
              <span className="footer-muted">iOS · not available</span>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <span className="footer-muted">Private / household use</span>
              <span className="footer-muted">Respect provider ToS</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 OneTune. All rights reserved.</span>
          <span className="footer-tag">Android · Self-hosted</span>
        </div>
      </div>
    </footer>
  );
}
