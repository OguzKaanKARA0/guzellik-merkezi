"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Star, Phone, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function HeroSection() {
  const t = useTranslations("hero");
  const { openModal } = useBooking();

  const stats = [
    { num: t("stat1Num"), label: t("stat1Label") },
    { num: t("stat2Num"), label: t("stat2Label") },
    { num: t("stat3Num"), label: t("stat3Label") },
  ];

  return (
    <section
      id="hero"
      className="hero-grid"
      style={{
        minHeight: "calc(100vh - 72px)",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "5rem 1.5rem 4rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
        /* ── Reserve space so locale switch doesn't jump ── */
        alignContent: "center",
      }}
    >
      {/* Left: Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 1rem", borderRadius: "9999px", border: "1px solid rgba(212,175,55,0.4)", backgroundColor: "rgba(212,175,55,0.08)", width: "fit-content" }}>
          <Star size={13} style={{ color: "var(--color-gold)" }} fill="var(--color-gold)" />
          <span style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-gold-dark)" }}>
            {t("badge")}
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, lineHeight: 1.15, color: "var(--color-charcoal)", margin: 0 }}>
          {t("title1")}{" "}
          <em style={{ fontStyle: "italic", color: "var(--color-gold)", fontWeight: 400 }}>{t("titleItalic")}</em>{" "}
          <br />
          {t("title2")}
        </h1>

        <div className="gold-line" />

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.75, color: "var(--color-charcoal-muted)", margin: 0, maxWidth: "480px" }}>
          {t("description")}
        </p>

        <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 600, color: "var(--color-gold)", lineHeight: 1 }}>{s.num}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--color-charcoal-muted)", letterSpacing: "0.05em" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            id="hero-cta-primary"
            onClick={openModal}
            className="btn-gold"
            style={{ fontSize: "0.875rem", cursor: "pointer", border: "none" }}
          >
            {t("ctaPrimary")}
            <ArrowRight size={16} />
          </button>
          <a href="tel:+905001234567" id="hero-cta-secondary" className="btn-ghost">
            <Phone size={14} />
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      {/* Right: Visual placeholder */}
      <div style={{ position: "relative" }}>
        <div style={{ borderRadius: "var(--radius-2xl)", overflow: "hidden", aspectRatio: "4/5", background: "linear-gradient(145deg, #f7f0d8 0%, #ede0b0 40%, #d4c07a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", position: "relative", boxShadow: "0 24px 64px rgba(212,175,55,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ position: "absolute", top: "10%", right: "10%", width: "120px", height: "120px", borderRadius: "9999px", background: "rgba(212,175,55,0.15)" }} />
          <div style={{ position: "absolute", bottom: "15%", left: "8%", width: "80px", height: "80px", borderRadius: "9999px", background: "rgba(212,175,55,0.12)" }} />
          <div style={{ width: "80px", height: "80px", borderRadius: "9999px", background: "rgba(255,253,208,0.7)", border: "2px dashed rgba(212,175,55,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={32} style={{ color: "var(--color-gold)" }} />
          </div>
          <div style={{ textAlign: "center", padding: "0 2rem" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-charcoal-light)", margin: 0, fontStyle: "italic" }}>{t("placeholderTitle")}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--color-charcoal-muted)", marginTop: "0.35rem" }}>{t("placeholderSub")}</p>
          </div>
        </div>

        {/* Floating bottom-left badge */}
        <div style={{ position: "absolute", bottom: "2rem", left: "-1.5rem", background: "#fff", borderRadius: "var(--radius-xl)", padding: "1rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "190px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Star size={18} fill="#fff" style={{ color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "var(--color-charcoal)" }}>{t("badgePreferred")}</p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--color-charcoal-muted)" }}>★★★★★ {t("badgeReviews")}</p>
          </div>
        </div>

        {/* Floating top-right card */}
        <div style={{ position: "absolute", top: "1.5rem", right: "-1.25rem", background: "var(--color-charcoal)", borderRadius: "var(--radius-xl)", padding: "0.85rem 1.1rem", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "145px" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("badgeSlotLabel")}</p>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--color-gold)" }}>{t("badgeSlotValue")}</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; padding-top: 3rem !important; padding-bottom: 3rem !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
