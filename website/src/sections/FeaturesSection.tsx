import { Reveal } from "../components/Reveal";
import { features } from "../data/content";

export function FeaturesSection() {
  return (
    <section id="features" className="section section-features">
      <Reveal className="section-head center">
        <h2>
          Everything you need.
          <br />
          <span className="muted">Nothing you don&apos;t.</span>
        </h2>
        <p className="section-sub center">
          A real native Android player — not a web wrapper. Dark, fast, and tuned for long
          listening sessions.
        </p>
      </Reveal>
      <div className="feature-grid">
        {features.map((feature) => (
          <Reveal key={feature.title} delay={feature.delay}>
            <article className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
