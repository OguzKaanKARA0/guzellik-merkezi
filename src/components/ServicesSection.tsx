"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useBooking } from "@/context/BookingContext";
import { useLocale } from "next-intl";

const services = [
  { id: "hair", image: "/gallery/service_hair.png" },
  { id: "skin", image: "/gallery/service_skin.png" },
  { id: "makeup", image: "/gallery/service_makeup.png" },
  { id: "nails", image: "/gallery/service_nails.png" },
  { id: "brows", image: "/gallery/service_brows.png" },
  { id: "permanent", image: "/gallery/service_permanent.png" },
];

export default function ServicesSection() {
  const t = useTranslations("services");
  const locale = useLocale();
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="hizmetler" style={{ padding: "8rem 1.5rem", background: "var(--color-bg)" }}>
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={16} style={{ color: "var(--color-gold)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold-dark)" }}>
              {t("badge")}
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-primary)", margin: 0, lineHeight: 1.1 }}>
            {t("title")}{" "}
            <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>{t("titleItalic")}</em>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", color: "var(--color-charcoal-muted)", maxWidth: "600px", margin: "0 auto", marginTop: "0.5rem" }}>
            {t("desc")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
          {services.map((svc) => (
            <ServiceCard key={svc.id} svc={svc} title={t(svc.id)} ctaLabel={t("cta")} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  svc,
  title,
  ctaLabel,
  locale
}: {
  svc: { id: string; image: string };
  title: string;
  ctaLabel: string;
  locale: string;
}) {
  const [hovered, setHovered] = useState(false);
  const { openServiceDetails, openLeadModal } = useBooking();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        console.log("[ServicesSection] Opening details for:", svc.id);
        openServiceDetails(svc.id);
      }}
      style={{
        position: "relative",
        borderRadius: "0.5rem",
        overflow: "hidden",
        cursor: "pointer",
        aspectRatio: "3/4",
        border: "0.5px solid rgba(201, 169, 110, 0.2)",
        transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        boxShadow: hovered ? "0 20px 48px rgba(201,169,110,0.2)" : "none",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        touchAction: "manipulation",
        zIndex: 1
      }}
    >
      {/* Background Image */}
      <Image
        src={svc.image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          transition: "transform 0.8s ease",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered 
            ? "linear-gradient(to top, rgba(44,24,16,0.9) 0%, rgba(44,24,16,0.2) 50%, rgba(44,24,16,0.1) 100%)"
            : "linear-gradient(to top, rgba(44,24,16,0.8) 0%, rgba(44,24,16,0.1) 50%, transparent 100%)",
          transition: "background 0.5s ease",
        }}
      />

      {/* Border Glow Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: hovered ? "1.5px solid rgba(201,169,110,0.6)" : "0.5px solid transparent",
          transition: "border 0.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--color-bg)", margin: 0 }}>
          {title}
        </h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold)", opacity: hovered ? 1 : 0.7, transition: "opacity 0.3s ease" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {ctaLabel}
            </span>
            <ArrowRight size={16} style={{ transform: hovered ? "translateX(4px)" : "translateX(0)", transition: "transform 0.3s ease" }} />
          </div>
          <a 
            href={`/${locale}/hizmetler/${svc.id}`} 
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            Detayları İncele
          </a>
        </div>

        {/* WhatsApp Teklif Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openLeadModal(title);
          }}
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.85rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--color-bg)",
            background: "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.05))",
            border: "0.5px solid rgba(201,169,110,0.5)",
            backdropFilter: "blur(8px)",
            textDecoration: "none",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-gold)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.05))";
            e.currentTarget.style.color = "var(--color-bg)";
          }}
        >
          <MessageCircle size={16} />
          Size Özel Teklif Alın
        </button>
      </div>
    </div>
  );
}
