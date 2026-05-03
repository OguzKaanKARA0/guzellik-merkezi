"use client";

import { useTranslations } from "next-intl";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Sparkles, Star, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TestimonialsSection() {
  const t = useTranslations("testimonials");
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.15 });
  const reviews = t.raw("reviews") as { name: string; service: string; text: string }[];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll listener for active dots indicator
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollPosition = el.scrollLeft;
      const cardWidth = el.offsetWidth;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(newIndex);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({
      left: cardWidth * index,
      behavior: "smooth"
    });
  };

  // Auto-play interval
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % reviews.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth;
          scrollRef.current.scrollTo({
            left: cardWidth * nextIndex,
            behavior: "smooth"
          });
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews]);

  return (
    <section
      id="yorumlar"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "8rem 1.5rem",
        position: "relative",
      }}
    >
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
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
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-charcoal)", margin: 0, lineHeight: 1.1 }}>
            {t("title")} <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>{t("titleItalic")}</span>
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              gap: "2rem",
              paddingBottom: "2rem",
            }}
            className="hide-scrollbar"
          >
            {reviews && reviews.map((review, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: "100%",
                  scrollSnapAlign: "center",
                  backgroundColor: "#fff",
                  padding: "3rem",
                  borderRadius: "1rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "1.5rem",
                  position: "relative"
                }}
              >
                <Quote size={40} style={{ color: "var(--color-gold)", opacity: 0.2, position: "absolute", top: "2rem", left: "2rem" }} />
                
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={20} fill="var(--color-gold)" color="var(--color-gold)" />
                  ))}
                </div>
                
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", lineHeight: 1.8, color: "var(--color-charcoal-light)", margin: 0, fontStyle: "italic", maxWidth: "80%" }}>
                  "{review.text}"
                </p>
                
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "var(--color-charcoal)", fontWeight: 600 }}>
                    {review.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                    {review.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
            {reviews && reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                style={{
                  width: activeIndex === idx ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: activeIndex === idx ? "var(--color-gold)" : "rgba(212,175,55,0.3)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
