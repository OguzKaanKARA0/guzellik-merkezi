"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import Image from "next/image";

export default function HeroSection() {
  const t = useTranslations("hero");
  const { openModal } = useBooking();
  const words = t.raw("titleWords") as string[];
  const [wordIndex, setWordIndex] = useState(0);

  const bgImages = [
    "/gallery/hero_fallback.png",
    "/gallery/service_skin.png",
    "/gallery/service_hair.png"
  ];

  useEffect(() => {
    if (!words || words.length === 0) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words]);

  const longestWord = words ? [...words].sort((a, b) => b.length - a.length)[0] : "";

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginTop: "-72px", // Pull up behind the sticky navbar
      }}
    >
      {/* Background Images Layering for Smooth Cross-Fade */}
      <div style={{ position: "absolute", inset: 0, zIndex: -2, backgroundColor: "var(--color-primary)" }}>
        {bgImages.map((src, index) => {
          const isActive = index === wordIndex % bgImages.length;
          return (
            <div
              key={src}
              style={{
                position: "absolute",
                inset: 0,
                opacity: isActive ? 1 : 0,
                // Yeni görsel gelince anında (0s delay) opacity 1'e doğru fade-in başlar.
                // Eski görsel ise 1.5sn bekler (delay), fade-in bitince fade-out olur. 
                // Bu sayede altta hep bir görsel kalır, siyah parlama engellenir.
                transition: isActive ? "opacity 1.5s ease-in-out" : "opacity 1.5s ease-in-out 1.5s",
                zIndex: isActive ? 1 : 0,
              }}
            >
              <Image
                src={src}
                alt="Luxe Beauty Experience"
                fill
                priority // Geçişlerde gecikme yaşanmaması için
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          );
        })}
      </div>

      {/* Overlay to ensure text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background: "linear-gradient(to bottom, rgba(44,24,16,0.2) 0%, rgba(44,24,16,0.7) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "900px",
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          marginTop: "72px", // Offset for the pulled up navbar
        }}
        className="fade-up in-view"
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem", borderRadius: "9999px", border: "0.5px solid rgba(201, 169, 110, 0.4)", backgroundColor: "rgba(44,24,16,0.3)", backdropFilter: "blur(8px)" }}>
          <Sparkles size={14} style={{ color: "var(--color-gold)" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-bg)" }}>
            {t("badge")}
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 400, lineHeight: 1.1, color: "var(--color-bg)", margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {t("titleStatic")}
          <br />
          <span style={{ display: "inline-block", position: "relative", verticalAlign: "bottom", minWidth: "6.5em", textAlign: "center" }}>
            {/* Görünmez yer tutucu (en uzun kelime) sayesinde genişlik sabit kalır */}
            <em style={{ display: "block", fontStyle: "italic", color: "var(--color-gold)", opacity: 0, pointerEvents: "none", visibility: "hidden" }}>
              {longestWord}
            </em>
            
            {words && words.map((word, index) => {
              // Yön hesaplama: Önceki kelime yukarı çıkar, yeni kelime aşağıdan gelir
              const isCurrent = index === wordIndex;
              // Eğer geçerli index değilse, bir önceki index mi diye kontrol et (veya sonuncuysa 0'a geçerken)
              const isPrevious = (wordIndex === 0 && index === words.length - 1) || (index === wordIndex - 1);
              
              return (
                <em
                  key={word}
                  style={{
                    display: "block",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    fontStyle: "italic",
                    color: "var(--color-gold)",
                    opacity: isCurrent ? 1 : 0,
                    transform: isCurrent ? "translateY(0) scale(1)" : (isPrevious ? "translateY(-40px) scale(0.95)" : "translateY(40px) scale(0.95)"),
                    filter: isCurrent ? "blur(0px)" : "blur(4px)",
                    transition: "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: isCurrent ? "auto" : "none",
                  }}
                >
                  {word}
                </em>
              );
            })}
          </span>
        </h1>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", lineHeight: 1.8, color: "rgba(250,247,242,0.85)", margin: 0, maxWidth: "600px", letterSpacing: "0.02em" }}>
          {t("description")}
        </p>

        <button
          onClick={openModal}
          className="btn-gold"
          style={{ marginTop: "1rem", fontSize: "0.95rem", padding: "1rem 3.5rem" }}
        >
          {t("ctaPrimary")}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
