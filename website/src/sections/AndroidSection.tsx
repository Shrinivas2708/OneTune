import { ApkLink } from "../components/ApkLink";
import { Reveal } from "../components/Reveal";

const androidFeatures = [
  "Notification & lock-screen media controls",
  "MMKV-fast session & offline library",
  "Standalone release APK for sideloading",
  "Connects to your self-hosted API",
] as const;

export function AndroidSection() {
  return (
    <section id="android" className="section android-section">
      <Reveal>
        <div className="android-inner">
          <div className="android-copy">
            <p className="eyebrow">Android only</p>
            <h2>
              Built for Android.
              <br />
              Nothing else required.
            </h2>
            <p className="section-sub">
              Native playback with lock-screen controls, offline storage, and a dev workflow you
              own — local APK builds, ADB install, no cloud build lock-in.
            </p>
            <ul className="android-list">
              {androidFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="android-badge-stack">
            <div className="store-badge primary">
              <span className="store-icon">▶</span>
              <div>
                <small>Get it on</small>
                <strong>Google Play</strong>
                <span className="soon">Coming soon</span>
              </div>
            </div>
            <ApkLink className="store-badge outline" href="#download">
              <span className="store-icon">⬇</span>
              <div>
                <small>Direct install</small>
                <strong>Android APK</strong>
                <span className="ready">Available now</span>
              </div>
            </ApkLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
