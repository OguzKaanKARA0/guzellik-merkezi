"use client";

import { useState } from "react";
import { Sparkles, Leaf, Palette, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Sparkles, Leaf, Palette];

export default function ServicesSection() {
  const t = useTranslations("services");

  const items = (t.raw("items") as Array<{ id: string; title: string; description: string; badge: string | null }>);

  return (
    <section id="hizmetler" style={{ padding: "6rem 1.5rem", background: "var(--color-charcoal)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", display: "block", marginBottom: "0.75rem" }}>
            {t("eyebrow")}
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "#fff", margin: "0 0 1rem", lineHeight: 1.2 }}>
            {t("title")}{" "}
            <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>{t("titleItalic")}</em>
          </h2>
          <div style={{ width: "3.5rem", height: "2px", background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))", borderRadius: "999px", margin: "0 auto" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
          {items.map((svc, i) => (
            <ServiceCard key={svc.id} svc={svc} Icon={icons[i]} ctaLabel={t("cta")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  svc,
  Icon,
  ctaLabel,
}: {
  svc: { id: string; title: string; description: string; badge: string | null };
  Icon: React.ElementType;
  ctaLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={`service-${svc.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "linear-gradient(145deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "1.25rem",
        padding: "2.25rem 2rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: hovered ? "0 20px 48px rgba(212,175,55,0.15), 0 4px 16px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.15)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {svc.badge && (
        <span style={{ position: "absolute", top: "1.25rem", right: "1.25rem", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-charcoal)", background: "var(--color-gold)", padding: "0.25rem 0.65rem", borderRadius: "999px" }}>
          {svc.badge}
        </span>
      )}
      <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: hovered ? "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))" : "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s ease", flexShrink: 0 }}>
        <Icon size={24} style={{ color: hovered ? "#fff" : "var(--color-gold)", transition: "color 0.3s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 500, color: "#fff", margin: 0 }}>{svc.title}</h3>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0 }}>{svc.description}</p>
      </div>
      <a href={`#${svc.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none", marginTop: "auto" }}>
        {ctaLabel}
        <ArrowRight size={14} />
      </a>
    </div>
  );
}
