"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles } from "lucide-react";
import { STATS } from "@/constants/stats";

function AnimatedCounter({ endValue, duration = 2000, suffix = "" }: { endValue: number; duration?: number; suffix?: string }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isIntersecting) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * endValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isIntersecting, endValue, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function AboutSection() {
  const t = useTranslations("about");
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      id="hakkimizda"
      style={{
        backgroundColor: "var(--color-bg)",
        padding: "8rem 1.5rem",
        position: "relative",
      }}
    >
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6rem",
          alignItems: "center",
        }}
      >
        {/* Left Column: Brand Story */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={16} style={{ color: "var(--color-gold)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold-dark)" }}>
                {t("badge")}
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-primary)", margin: 0, lineHeight: 1.1 }}>
              {t("title")}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.8, color: "var(--color-charcoal-light)", margin: 0 }}>
              {t("storyP1")}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.8, color: "var(--color-charcoal-light)", margin: 0 }}>
              {t("storyP2")}
            </p>
          </div>
        </div>

        {/* Right Column: Animated Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          {/* Stat 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.5rem", borderLeft: "0.5px solid var(--color-gold)" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 400, color: "var(--color-primary)", lineHeight: 1 }}>
              <AnimatedCounter endValue={STATS.years.value} suffix={STATS.years.suffix} />
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-charcoal-muted)" }}>
              {t("stat1Label")}
            </span>
          </div>

          {/* Stat 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.5rem", borderLeft: "0.5px solid var(--color-gold)" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 400, color: "var(--color-primary)", lineHeight: 1 }}>
              <AnimatedCounter endValue={STATS.clients.value} suffix={STATS.clients.suffix} />
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-charcoal-muted)" }}>
              {t("stat2Label")}
            </span>
          </div>

          {/* Stat 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.5rem", borderLeft: "0.5px solid var(--color-gold)" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 400, color: "var(--color-primary)", lineHeight: 1 }}>
              <AnimatedCounter endValue={STATS.specialists.value} suffix={STATS.specialists.suffix} />
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-charcoal-muted)" }}>
              {t("stat3Label")}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #hakkimizda > div {
            grid-template-columns: 1fr !important;
            gap: 4rem !important;
          }
        }
      `}</style>
    </section>
  );
}
