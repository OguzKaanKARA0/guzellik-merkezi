"use client";

import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function CtaBanner() {
  const t = useTranslations("ctaBanner");
  const { openModal } = useBooking();
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section style={{ padding: "8rem 1.5rem", background: "var(--color-bg)", display: "flex", justifyContent: "center" }}>
      <div
        ref={ref}
        className={`fade-up ${isIntersecting ? "in-view" : ""}`}
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "var(--color-primary)",
          borderRadius: "0", // Keeping it sharp for the minimalist look
          padding: "5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "2rem",
          boxShadow: "0 24px 64px rgba(44,24,16,0.15)",
          border: "0.5px solid rgba(201,169,110,0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "150%", height: "150%", background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--color-bg)", margin: 0, lineHeight: 1.1 }}>
            {t("title")}
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(250,247,242,0.7)", margin: 0, maxWidth: "500px" }}>
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={openModal}
          className="btn-gold"
          style={{ position: "relative", zIndex: 1, padding: "1.2rem 3rem", fontSize: "0.95rem" }}
        >
          {t("btn")}
        </button>
      </div>
    </section>
  );
}
