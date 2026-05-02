"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/* ─────────────────────────────────────────────────────
   Önce / Sonra Sürükleme Kaydırıcısı
   – Mouse + Touch destekli
   – Tamamen CSS + Intersection Observer (sıfır bağımlılık)
───────────────────────────────────────────────────── */
export default function BeforeAfterSection() {
  const t = useTranslations("beforeAfter");

  return (
    <section style={{ padding: "6rem 1.5rem", background: "linear-gradient(160deg, #fff9e0 0%, var(--color-cream) 100%)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", display: "block", marginBottom: "0.75rem" }}>
            {t("eyebrow")}
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "var(--color-charcoal)", margin: "0 0 0.5rem", lineHeight: 1.2 }}>
            {t("title")}{" "}
            <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>{t("titleItalic")}</em>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--color-charcoal-muted)", margin: "0.75rem 0 0", lineHeight: 1.7 }}>{t("subtitle")}</p>
          <div style={{ width: "3.5rem", height: "2px", background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))", borderRadius: "999px", margin: "1.5rem auto 0" }} />
        </div>

        {/* Sürükleme alanı */}
        <DragSlider
          beforeSrc="/gallery/before.png"
          afterSrc="/gallery/after.png"
          beforeLabel={t("beforeLabel")}
          afterLabel={t("afterLabel")}
        />

        {/* Disclaimer */}
        <p style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.8rem", color: "var(--color-charcoal-muted)", lineHeight: 1.6 }}>
          {t("disclaimer")}
        </p>
      </div>
    </section>
  );
}

/* ── Sürükleme Kaydırıcısı Bileşeni ── */
function DragSlider({
  beforeSrc, afterSrc, beforeLabel, afterLabel,
}: {
  beforeSrc: string; afterSrc: string; beforeLabel: string; afterLabel: string;
}) {
  const [pos, setPos]         = useState(50); // 0–100 yüzde
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const calcPos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPos(pct);
  }, []);

  /* Mouse */
  const onMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setDragging(true); calcPos(e.clientX); };
  const onMouseMove = useCallback((e: MouseEvent) => { if (dragging) calcPos(e.clientX); }, [dragging, calcPos]);
  const onMouseUp   = useCallback(() => setDragging(false), []);

  /* Touch */
  const onTouchStart = (e: React.TouchEvent) => { setDragging(true); calcPos(e.touches[0].clientX); };
  const onTouchMove  = useCallback((e: TouchEvent) => { if (dragging) { e.preventDefault(); calcPos(e.touches[0].clientX); } }, [dragging, calcPos]);
  const onTouchEnd   = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup",   onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend",  onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [dragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position:      "relative",
        width:         "100%",
        maxWidth:      "720px",
        margin:        "0 auto",
        aspectRatio:   "3/4",
        borderRadius:  "1.5rem",
        overflow:      "hidden",
        cursor:        dragging ? "grabbing" : "grab",
        boxShadow:     "0 24px 64px rgba(0,0,0,0.16)",
        userSelect:    "none",
        touchAction:   "none",
      }}
    >
      {/* SONRA görseli (arka plan, tam genişlik) */}
      <Image
        src={afterSrc}
        alt={afterLabel}
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />

      {/* ÖNCE görseli (clipPath ile kırpılır) */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          clipPath:   `inset(0 ${100 - pos}% 0 0)`,
          transition: dragging ? "none" : "clip-path 0.05s",
        }}
      >
        <Image
          src={beforeSrc}
          alt={beforeLabel}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Sürükleme çizgisi */}
      <div
        style={{
          position:    "absolute",
          top:         0,
          bottom:      0,
          left:        `${pos}%`,
          width:       "2px",
          background:  "#fff",
          transform:   "translateX(-50%)",
          boxShadow:   "0 0 12px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}
      />

      {/* Sürükleme tutacağı */}
      <div
        style={{
          position:   "absolute",
          top:        "50%",
          left:       `${pos}%`,
          transform:  "translate(-50%, -50%)",
          width:      "44px",
          height:     "44px",
          borderRadius: "9999px",
          background: "#fff",
          boxShadow:  "0 4px 20px rgba(0,0,0,0.25)",
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          gap:        "3px",
          pointerEvents: "none",
        }}
      >
        {/* Sol-sağ ok ikonları */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
        </svg>
      </div>

      {/* ÖNCE etiketi */}
      <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem" }}>
        <Label text={beforeLabel} />
      </div>

      {/* SONRA etiketi */}
      <div style={{ position: "absolute", bottom: "1.25rem", right: "1.25rem" }}>
        <Label text={afterLabel} />
      </div>

      {/* İlk kullanım ipucu */}
      <div
        style={{
          position:   "absolute",
          top:        "1.25rem",
          left:       "50%",
          transform:  "translateX(-50%)",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          borderRadius: "999px",
          padding:    "0.35rem 1rem",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em" }}>
          ↔ Sürükle
        </span>
      </div>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span style={{
      display:      "inline-block",
      padding:      "0.35rem 0.9rem",
      borderRadius: "999px",
      background:   "rgba(255,255,255,0.22)",
      backdropFilter: "blur(10px)",
      border:       "1px solid rgba(255,255,255,0.4)",
      fontSize:     "0.78rem",
      fontWeight:   600,
      color:        "#fff",
      letterSpacing: "0.06em",
      textShadow:   "0 1px 3px rgba(0,0,0,0.4)",
    }}>
      {text}
    </span>
  );
}
