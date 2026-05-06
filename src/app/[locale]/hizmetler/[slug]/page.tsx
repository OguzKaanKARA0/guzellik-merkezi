import { Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const messages: any = await getMessages({ locale });
  const service = messages.services.details[slug];

  if (!service) {
    return {
      title: "Hizmet Bulunamadı | Luxe Beauty",
    };
  }

  return {
    title: `${service.title} | Luxe Beauty Profesyonel Hizmetler`,
    description: service.description,
    openGraph: {
      title: `${service.title} | Luxe Beauty`,
      description: service.description,
      images: [`https://luxebeauty.com/gallery/service_${slug}.png`],
    },
  };
}

export function generateStaticParams() {
  const slugs = ["hair", "skin", "makeup", "nails", "brows", "permanent"];
  const params: any[] = [];

  routing.locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });

  return params;
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const messages: any = await getMessages({ locale });
  const service = messages.services.details[slug];

  if (!service) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "var(--color-bg)", minHeight: "80vh" }}>
        <div style={{ padding: "8rem 1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold)" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Premium Hizmetlerimiz
              </span>
            </div>
            
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(3rem, 6vw, 4.5rem)", fontWeight: 400, color: "var(--color-primary)", margin: 0, lineHeight: 1.1 }}>
              {service.title}
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginTop: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <p style={{ fontSize: "1.2rem", lineHeight: 1.8, color: "var(--color-charcoal)", fontWeight: 300 }}>
                  {service.description}
                </p>
                <div style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-gold)", background: "rgba(212,175,55,0.05)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Uygulama Süreci</h4>
                  <p style={{ margin: 0, fontSize: "1rem", color: "var(--color-charcoal-muted)", lineHeight: 1.6 }}>
                    {service.process}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ padding: "0.5rem 1rem", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "99px", fontSize: "0.85rem", color: "var(--color-gold-dark)" }}>
                    {service.duration}
                  </div>
                </div>
              </div>

              <div style={{ position: "relative", aspectRatio: "4/5", background: "#eee", overflow: "hidden", borderRadius: "1rem" }}>
                 <Image 
                   src={`/gallery/service_${slug}.png`} 
                   alt={service.title} 
                   fill
                   style={{ objectFit: "cover" }}
                 />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
