import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Shop from "@/components/shop/Shop";
import Reviews from "@/components/Reviews";
import AboutVideos from "@/components/AboutVideos";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative w-full overflow-visible">
      <Hero />
      <Marquee />
      <Shop />
      <Reviews />
      <AboutVideos />
      <Footer />
    </main>
  );
}
