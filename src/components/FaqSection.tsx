"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FaqSection() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Array<{ q: string; a: string }>;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" style={{ padding: "5rem 1.5rem", background: "var(--color-cream)", position: "relative", overflow: "hidden" }}>
      {/* Background decorations */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Sparkles size={16} style={{ color: "var(--color-gold)" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold)" }}>
              {t("eyebrow")}
            </span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 400, color: "var(--color-charcoal)", lineHeight: 1.1 }}>
            {t("title")} <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>{t("titleItalic")}</span>
          </h2>
          <div className="gold-line" style={{ marginTop: "1.5rem" }} />
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                style={{ 
                  background: "#fff", 
                  borderRadius: "1rem", 
                  border: "1px solid rgba(212,175,55,0.15)",
                  boxShadow: isOpen ? "0 10px 30px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.3s ease",
                  overflow: "hidden"
                }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem 1.5rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 600, color: isOpen ? "var(--color-gold)" : "var(--color-charcoal)", transition: "color 0.2s" }}>
                    {item.q}
                  </span>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", background: isOpen ? "var(--color-gold)" : "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    transition: "all 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0)"
                  }}>
                    <ChevronDown size={18} style={{ color: isOpen ? "#fff" : "var(--color-gold)" }} />
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? "200px" : "0",
                  opacity: isOpen ? 1 : 0,
                  transition: "all 0.3s ease-in-out",
                  padding: isOpen ? "0 1.5rem 1.25rem" : "0 1.5rem"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-charcoal-light)" }}>
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
