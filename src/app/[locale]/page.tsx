import Navbar            from "@/components/Navbar";
import HeroSection        from "@/components/HeroSection";
import AboutSection       from "@/components/AboutSection";
import ServicesSection    from "@/components/ServicesSection";
import WhyUsSection       from "@/components/WhyUsSection";
import GallerySection     from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection         from "@/components/FaqSection";
import ContactSection    from "@/components/ContactSection";
import Footer             from "@/components/Footer";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  return {
    title: `Luxe Beauty | ${t("titleStatic")}`,
    description: t("description"),
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WhyUsSection />
        <GallerySection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
