"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { X, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";

const serviceImages: Record<string, string> = {
  hair: "/gallery/service_hair.png",
  skin: "/gallery/service_skin.png",
  makeup: "/gallery/service_makeup.png",
  nails: "/gallery/service_nails.png",
  brows: "/gallery/service_brows.png",
  permanent: "/gallery/service_permanent.png",
};

export default function ServiceDetailsModal() {
  const t = useTranslations("services.details");
  const tNav = useTranslations("nav");
  const { serviceDetailsId, closeServiceDetails, openModal } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (serviceDetailsId) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 400); // transition duration
      return () => clearTimeout(timer);
    }
  }, [serviceDetailsId]);

  if (!serviceDetailsId && !visible) return null;

  const id = serviceDetailsId || "hair"; // fallback for animation exit
  const image = serviceImages[id];
  const title = t(`${id}.title`);
  const duration = t(`${id}.duration`);
  const description = t(`${id}.description`);
  const process = t(`${id}.process`);

  const handleBookNow = () => {
    closeServiceDetails();
    setTimeout(() => {
      openModal();
    }, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(20, 18, 14, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.4s ease, visibility 0.4s ease",
        padding: "1.5rem"
      }}
      onClick={closeServiceDetails}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          height: "auto",
          minHeight: "500px",
          backgroundColor: "var(--color-bg)",
          borderRadius: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "row",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Pure Image */}
        <div className="modal-left" style={{ flex: "1 1 45%", position: "relative", minHeight: "400px" }}>
          <Image src={image} alt={title} fill style={{ objectFit: "cover" }} priority />
        </div>

        {/* Right Side: Clean Content Area */}
        <div className="modal-right" style={{ flex: "1 1 55%", position: "relative", display: "flex", flexDirection: "column", padding: "3.5rem 3rem", overflowY: "auto", backgroundColor: "var(--color-bg)" }}>
          
          <button
            onClick={closeServiceDetails}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-charcoal-muted)",
              transition: "color 0.2s ease, transform 0.2s ease",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.transform = "scale(1.1) rotate(90deg)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-charcoal-muted)"; e.currentTarget.style.transform = "scale(1) rotate(0deg)" }}
            aria-label="Close"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Header */}
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", margin: "0 0 0.75rem 0", lineHeight: 1.1, fontWeight: 400 }}>
                {title}
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold-dark)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <Clock size={15} />
                {duration}
              </div>
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-charcoal-muted)", margin: "0 0 0.5rem 0", fontWeight: 600 }}>Hizmet Hakkında</h3>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", lineHeight: 1.8, color: "var(--color-primary)", margin: 0, fontStyle: "italic" }}>
                  "{description}"
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-charcoal-muted)", margin: "0 0 0.5rem 0", fontWeight: 600 }}>Süreç ve Uygulama</h3>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <CheckCircle2 size={18} strokeWidth={2} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--color-primary)", margin: 0 }}>
                    {process}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: "3rem" }}>
            <button onClick={handleBookNow} className="btn-gold" style={{ width: "100%", padding: "1rem", fontSize: "0.9rem" }}>
              {tNav("bookBtn")}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .modal-left { display: none !important; }
          .modal-right { padding: 2.5rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
