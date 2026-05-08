"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";

const photos = [
  { file: "/gallery/hair_styling.png",  key: "hair" },      // Tall
  { file: "/gallery/skin_care.png",     key: "skin" },      // Small
  { file: "/gallery/hand_care.png",     key: "nails" },     // Small
  { file: "/gallery/eye_makeup.png",    key: "makeup" },    // Tall
  { file: "/gallery/microblading.png",  key: "brows" },     // Tall
  { file: "/gallery/makeup_kit.png",    key: "permanent" }, // Small
];

export default function GallerySection() {
  const t = useTranslations("gallery");
  const tSvc = useTranslations("services");

  const items = {
    hair: tSvc("hair"),
    skin: tSvc("skin"),
    makeup: tSvc("makeup"),
    nails: tSvc("nails"),
    brows: tSvc("brows"),
    permanent: tSvc("permanent"),
  };

  return (
    <section id="galeri" style={{ padding: "8rem 1.5rem", background: "var(--color-bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Sparkle size={12} style={{ color: "var(--color-gold)" }} />
            <span style={{ 
              fontSize: "0.75rem", 
              fontWeight: 600, 
              letterSpacing: "0.2em", 
              textTransform: "uppercase", 
              color: "var(--color-gold-dark)" 
            }}>
              {t("eyebrow")}
            </span>
          </div>
          <h2 style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)", 
            fontWeight: 400, 
            color: "var(--color-primary)", 
            margin: "0 0 1.5rem", 
            lineHeight: 1.1 
          }}>
            {t("title")} <em style={{ color: "var(--color-gold)", fontStyle: "italic", fontWeight: 300 }}>{t("titleItalic")}</em>
          </h2>
          <p style={{ 
            maxWidth: "600px", 
            margin: "0 auto 2rem", 
            color: "var(--color-charcoal-muted)", 
            fontSize: "1.05rem",
            lineHeight: 1.6
          }}>
            {t("subtitle")}
          </p>
          <div style={{ 
            width: "4rem", 
            height: "2px", 
            background: "var(--color-gold)", 
            margin: "0 auto",
            borderRadius: "99px",
            opacity: 0.6
          }} />
        </div>

        {/* Masonry-Style Rectangular Grid */}
        <div
          className="gallery-grid"
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "1.5rem",
            alignItems: "stretch"
          }}
        >
          {/* Column 1: Tall + Small */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <GalleryCard src={photos[0].file} label={items.hair} isTall />
            <GalleryCard src={photos[5].file} label={items.permanent} />
          </div>

          {/* Column 2: Small + Tall */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <GalleryCard src={photos[1].file} label={items.skin} />
            <GalleryCard src={photos[3].file} label={items.makeup} isTall />
          </div>

          {/* Column 3: Small + Tall */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <GalleryCard src={photos[2].file} label={items.nails} />
            <GalleryCard src={photos[4].file} label={items.brows} isTall />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .gallery-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 600px) {
            .gallery-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function GalleryCard({ src, label, isTall }: { src: string; label: string; isTall?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "1.5rem",
        overflow:     "hidden",
        position:     "relative",
        cursor:       "pointer",
        flex:         "1",
        // Precise aspect ratios to ensure the columns sum up to a perfect rectangle
        aspectRatio: isTall ? "4/6.5" : "4/3.5",
        boxShadow:    hovered ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transform:    hovered ? "translateY(-8px)" : "translateY(0)",
        transition:   "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <Image
        src={src}
        alt={label || "Gallery Image"}
        fill
        sizes="(max-width: 900px) 50vw, 33vw"
        style={{ 
          objectFit: "cover", 
          transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hovered ? "scale(1.1)" : "scale(1)"
        }}
      />

      {/* Overlay */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: hovered ? "linear-gradient(to top, rgba(44, 24, 16, 0.8), transparent)" : "transparent",
        transition: "all 0.5s ease",
        display:    "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "2rem",
        opacity: hovered ? 1 : 0
      }}>
        <div style={{ 
          transform: hovered ? "translateY(0)" : "translateY(20px)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          <span style={{ 
            color: "var(--color-gold)", 
            fontSize: "0.75rem", 
            fontWeight: 600, 
            letterSpacing: "0.1em", 
            textTransform: "uppercase",
            display: "block",
            marginBottom: "0.5rem"
          }}>
            Luxe Beauty
          </span>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "1.25rem", fontWeight: 500 }}>
            {label}
          </h3>
        </div>
      </div>
    </div>
  );
}
