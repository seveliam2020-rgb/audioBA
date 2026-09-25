import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import AuthorSpotlight from "../components/AuthorSpotlight";
import Catalog from "../components/Catalog";
import Pricing from "../components/Pricing";
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
        <AuthorSpotlight />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
