import { useState } from "react";
import { ApkLink } from "./ApkLink";
import { NavAnchor } from "../lib/navigation";

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12m0 0l4-4m-4 4L8 11M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#vibes", label: "Discover" },
  { href: "#android", label: "Android" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <NavAnchor href="#top" className="brand">
          <img src="/assets/icon.png" alt="" width={32} height={32} className="brand-icon" />
          <span>OneTune</span>
        </NavAnchor>

        <div className="header-right">
          <nav className="site-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavAnchor key={item.href} href={item.href}>
                {item.label}
              </NavAnchor>
            ))}
          </nav>
          <ApkLink className="nav-cta" >
            <DownloadIcon />
            Download for Android
          </ApkLink>
          <button
            className="menu-btn"
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Mobile" hidden={!mobileOpen}>
        {navItems.map((item) => (
          <NavAnchor key={item.href} href={item.href} onClick={closeMobile}>
            {item.label}
          </NavAnchor>
        ))}
        <ApkLink className="nav-cta nav-cta-mobile" href="#download" onClick={closeMobile}>
          Download for Android
        </ApkLink>
      </nav>
    </header>
  );
}
