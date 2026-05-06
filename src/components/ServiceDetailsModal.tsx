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
      const timer = setTimeout(() => {
        setVisible(false);
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
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(20, 18, 14, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.4s ease, visibility 0.4s ease",
        padding: "1rem",
        pointerEvents: visible ? "auto" : "none"
      }}
      onClick={closeServiceDetails}
    >
      <div
        className="details-modal-inner"
        style={{
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          backgroundColor: "var(--color-bg)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "row",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.98) translateY(20px)",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Pure Image */}
        <div className="modal-left" style={{ flex: "1 1 45%", position: "relative", minHeight: "400px" }}>
          <Image src={image} alt={title} fill style={{ objectFit: "cover" }} priority />
        </div>

        {/* Right Side: Content */}
        <div className="modal-right" style={{ flex: "1 1 55%", position: "relative", display: "flex", flexDirection: "column", padding: "3.5rem 3rem", overflowY: "auto", backgroundColor: "var(--color-bg)" }}>
          
          <button
            onClick={closeServiceDetails}
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              background: "rgba(201,169,110,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: "0 0 0.5rem 0", lineHeight: 1.1, fontWeight: 400 }}>
                {title}
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold-dark)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <Clock size={14} />
                {duration}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-charcoal-muted)", margin: "0 0 0.5rem 0", fontWeight: 600 }}>Hizmet Hakkında</h3>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--color-primary)", margin: 0, fontStyle: "italic" }}>
                  &quot;{description}&quot;
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-charcoal-muted)", margin: "0 0 0.5rem 0", fontWeight: 600 }}>Süreç ve Uygulama</h3>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-primary)", margin: 0 }}>
                    {process}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <button onClick={handleBookNow} className="btn-gold" style={{ width: "100%", padding: "1.1rem", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>
              {tNav("bookBtn")}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .details-modal-inner { 
            flex-direction: column !important; 
            max-height: 85vh !important;
            margin-top: 2rem;
          }
          .modal-left { 
            flex: 0 0 200px !important; 
            min-height: 200px !important;
          }
          .modal-right { 
            padding: 2rem 1.5rem !important;
            flex: 1 1 auto !important;
          }
          .details-modal-inner h2 {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
