import Navbar            from "@/components/Navbar";
import HeroSection        from "@/components/HeroSection";
import ServicesSection    from "@/components/ServicesSection";
import GallerySection     from "@/components/GallerySection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import FaqSection         from "@/components/FaqSection";
import Footer             from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <BeforeAfterSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
