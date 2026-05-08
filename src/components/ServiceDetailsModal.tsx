"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { X, Clock, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const serviceImages: Record<string, string> = {
  hair: "/gallery/service_hair.png",
  skin: "/gallery/service_skin.png",
  makeup: "/gallery/service_makeup.png",
  nails: "/gallery/service_nails.png",
  brows: "/gallery/service_brows.png",
  permanent: "/gallery/service_permanent.png",
};

const serviceIds = ["hair", "skin", "makeup", "nails", "brows", "permanent"];

export default function ServiceDetailsModal() {
  const t = useTranslations("services.details");
  const tNav = useTranslations("nav");
  const { serviceDetailsId, closeServiceDetails, openModal, openServiceDetails } = useBooking();
  const [visible, setVisible] = useState(false);
  const [cachedId, setCachedId] = useState<string | null>(null);

  useEffect(() => {
    if (serviceDetailsId) {
      setCachedId(serviceDetailsId);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
        setCachedId(null);
        document.body.style.overflow = "";
      }, 300); // reduced duration for snappier feel
      return () => clearTimeout(timer);
    }
  }, [serviceDetailsId]);

  if (!cachedId && !visible) return null;

  const id = cachedId || "hair"; 
  const currentIndex = serviceIds.indexOf(id);
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + serviceIds.length) % serviceIds.length;
    openServiceDetails(serviceIds[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % serviceIds.length;
    openServiceDetails(serviceIds[nextIndex]);
  };

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
        backgroundColor: "rgba(20, 18, 14, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.3s ease, visibility 0.3s ease",
        padding: "1rem",
        pointerEvents: visible ? "auto" : "none"
      }}
      onClick={closeServiceDetails}
    >
      {/* Navigation Arrows (Desktop) */}
      <button className="nav-arrow-left" onClick={handlePrev} style={{
        position: "absolute", left: "2rem", zIndex: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%", width: "60px", height: "60px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease"
      }}>
        <ChevronLeft size={32} />
      </button>

      <button className="nav-arrow-right" onClick={handleNext} style={{
        position: "absolute", right: "2rem", zIndex: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%", width: "60px", height: "60px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease"
      }}>
        <ChevronRight size={32} />
      </button>

      <div
        className="details-modal-inner"
        style={{
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          backgroundColor: "var(--color-bg)",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "row",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(30px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Pure Image */}
        <div className="modal-left" style={{ flex: "1 1 45%", position: "relative", minHeight: "500px" }}>
          <Image src={image} alt={title} fill style={{ objectFit: "cover" }} priority />
          {/* Mobile Nav Overlay */}
          <div className="mobile-nav-overlay" style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", display: "none", gap: "1rem" }}>
             <button onClick={handlePrev} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", p: 2 }}><ChevronLeft size={20}/></button>
             <button onClick={handleNext} style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", borderRadius: "50%", p: 2 }}><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="modal-right" style={{ flex: "1 1 55%", position: "relative", display: "flex", flexDirection: "column", padding: "4rem 3.5rem", overflowY: "auto", backgroundColor: "var(--color-bg)" }}>
          
          <button
            onClick={closeServiceDetails}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: "rgba(201,169,110,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,169,110,0.1)")}
            aria-label="Close"
          >
            <X size={22} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", margin: "0 0 0.5rem 0", lineHeight: 1.1, fontWeight: 400 }}>
                {title}
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold-dark)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                <Clock size={16} />
                {duration}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-charcoal-muted)", margin: "0 0 0.75rem 0", fontWeight: 700 }}>Hizmet Hakkında</h3>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", lineHeight: 1.8, color: "var(--color-primary)", margin: 0, fontStyle: "italic", opacity: 0.9 }}>
                  &quot;{description}&quot;
                </p>
              </div>

              <div style={{ padding: "1.5rem", background: "rgba(201,169,110,0.05)", borderRadius: "1rem", borderLeft: "3px solid var(--color-gold)" }}>
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-charcoal-muted)", margin: "0 0 0.75rem 0", fontWeight: 700 }}>Süreç ve Uygulama</h3>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "0.2rem" }} />
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-primary)", margin: 0 }}>
                    {process}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "3rem" }}>
            <button onClick={handleBookNow} className="btn-gold" style={{ width: "100%", padding: "1.25rem", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.15em" }}>
              {tNav("bookBtn")}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .nav-arrow-left:hover, .nav-arrow-right:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: scale(1.1);
        }
        @media (max-width: 1100px) {
          .nav-arrow-left, .nav-arrow-right { display: none !important; }
          .mobile-nav-overlay { display: flex !important; }
        }
        @media (max-width: 768px) {
          .details-modal-inner { 
            flex-direction: column !important; 
            max-height: 85vh !important;
            margin-top: 2rem;
          }
          .modal-left { 
            flex: 0 0 250px !important; 
            min-height: 250px !important;
          }
          .modal-right { 
            padding: 2.5rem 1.5rem !important;
            flex: 1 1 auto !important;
          }
          .details-modal-inner h2 {
            font-size: 1.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
