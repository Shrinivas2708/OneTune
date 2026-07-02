import { Ambient } from "./components/Ambient";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AndroidSection } from "./sections/AndroidSection";
import { CtaSection } from "./sections/CtaSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";
import { SplitSection } from "./sections/SplitSection";
import { VibesSection } from "./sections/VibesSection";

export default function App() {
  return (
    <>
      <Ambient />
      <Header />
      <main id="top">
        <HeroSection />
        <FeaturesSection />
        <VibesSection />
        <SplitSection />
        <AndroidSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
