"use client";

import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function TeamSection() {
  const t = useTranslations("team");
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.15 });

  // Use fallback images for now
  const teamImages = [
    "/gallery/hero_fallback.png",
    "/gallery/service_skin.png",
    "/gallery/service_hair.png"
  ];

  const members = t.raw("members") as { name: string; role: string }[];

  return (
    <section
      id="ekibimiz"
      style={{
        backgroundColor: "var(--color-bg)",
        padding: "8rem 1.5rem",
      }}
    >
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4rem",
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={16} style={{ color: "var(--color-gold)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold-dark)" }}>
              {t("badge")}
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-primary)", margin: 0, lineHeight: 1.1 }}>
            {t("title")} <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>{t("titleItalic")}</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem",
            width: "100%",
          }}
        >
          {members && members.map((member, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                alignItems: "center",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3/4",
                  overflow: "hidden",
                  borderRadius: "1rem",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
                }}
              >
                <Image
                  src={teamImages[idx % teamImages.length]}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-primary)", margin: "0 0 0.5rem 0", fontWeight: 400 }}>
                  {member.name}
                </h3>
                <p style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gold-dark)", margin: 0 }}>
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
