import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import BookSpotlight from "../components/BookSpotlight";
import Catalog from "../components/Catalog";
import Pricing from "../components/Pricing";
import AppSection from "../components/AppSection";
import Waitlist from "../components/Waitlist";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="grain relative min-h-screen bg-ink text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Catalog />
        <BookSpotlight />
        <Pricing />
        <AppSection />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
