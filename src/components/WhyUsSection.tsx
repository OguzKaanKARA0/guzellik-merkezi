"use client";

import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ShieldCheck, Award, Gem } from "lucide-react";

export default function WhyUsSection() {
  const t = useTranslations("whyUs");
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section style={{ padding: "8rem 1.5rem", background: "var(--color-primary)", color: "var(--color-bg)" }}>
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)" }}>
            {t("badge")}
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-bg)", margin: 0, lineHeight: 1.1 }}>
            {t("title")}
          </h2>
          <div className="gold-line" style={{ marginTop: "1rem" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem" }}>
          {/* Feature 1 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,169,110,0.05)" }}>
              <ShieldCheck size={36} strokeWidth={1.5} style={{ color: "var(--color-gold)" }} />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, margin: 0 }}>
              {t("f1Title")}
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(250,247,242,0.7)", margin: 0 }}>
              {t("f1Desc")}
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,169,110,0.05)" }}>
              <Award size={36} strokeWidth={1.5} style={{ color: "var(--color-gold)" }} />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, margin: 0 }}>
              {t("f2Title")}
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(250,247,242,0.7)", margin: 0 }}>
              {t("f2Desc")}
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,169,110,0.05)" }}>
              <Gem size={36} strokeWidth={1.5} style={{ color: "var(--color-gold)" }} />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, margin: 0 }}>
              {t("f3Title")}
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(250,247,242,0.7)", margin: 0 }}>
              {t("f3Desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
