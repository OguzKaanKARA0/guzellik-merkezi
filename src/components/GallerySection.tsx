"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { useTranslations } from "next-intl";

const photos = [
  { file: "/gallery/nails.png",  key: "nails"  },
  { file: "/gallery/skin.png",   key: "skin"   },
  { file: "/gallery/brow.png",   key: "brow"   },
  { file: "/gallery/makeup.png", key: "makeup" },
];

export default function GallerySection() {
  const t = useTranslations("gallery");
  const items = t.raw("items") as Array<{ label: string }>;

  return (
    <section id="galeri" style={{ padding: "6rem 1.5rem", background: "var(--color-cream)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", display: "block", marginBottom: "0.75rem" }}>
            {t("eyebrow")}
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "var(--color-charcoal)", margin: "0 0 1rem", lineHeight: 1.2 }}>
            <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>{t("title")}</em>
          </h2>
          <div style={{ width: "3.5rem", height: "2px", background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))", borderRadius: "999px", margin: "0 auto" }} />
        </div>

        {/* Fotoğraf ızgarası */}
        <div
          className="gallery-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}
        >
          {photos.map((photo, i) => (
            <GalleryCard
              key={photo.key}
              src={photo.file}
              label={items[i]?.label ?? ""}
            />
          ))}
        </div>

        <style>{`@media (max-width: 640px) { .gallery-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}

function GalleryCard({ src, label }: { src: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "1.25rem",
        overflow:     "hidden",
        aspectRatio:  "4/3",
        position:     "relative",
        cursor:       "pointer",
        boxShadow:    hovered ? "0 20px 48px rgba(0,0,0,0.18)" : "0 6px 20px rgba(0,0,0,0.09)",
        transform:    hovered ? "scale(1.02)" : "scale(1)",
        transition:   "transform 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* Gerçek fotoğraf */}
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        style={{ objectFit: "cover", objectPosition: "center", transition: "transform 0.5s ease" }}
      />

      {/* Hover overlay */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: hovered ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0)",
        transition: "background 0.35s ease",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {hovered && (
          <div style={{
            width: "52px", height: "52px", borderRadius: "9999px",
            background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>
            <ZoomIn size={22} style={{ color: "#fff" }} />
          </div>
        )}
      </div>

      {/* Etiket */}
      <div style={{
        position:   "absolute",
        bottom:     "1.25rem",
        left:       "1.25rem",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        border:     "1px solid rgba(255,255,255,0.3)",
        borderRadius: "999px",
        padding:    "0.35rem 0.9rem",
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#fff", letterSpacing: "0.05em" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
