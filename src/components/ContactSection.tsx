"use client";

import { MapPin, Phone, Mail, Clock, ArrowRight, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { useFeature } from "@/hooks/useFeature";

export default function ContactSection() {
  const t = useTranslations("footer");
  const { openModal, openLeadModal } = useBooking();
  const { value: canBook, loading: bookingLoading } = useFeature('booking');

  const contactInfo = [
    {
      icon: MapPin,
      label: "ADRES",
      value: "Teşvikiye Caddesi No:42, Nişantaşı / İstanbul"
    },
    {
      icon: Phone,
      label: "TELEFON",
      value: "+90 212 555 12 34"
    },
    {
      icon: Mail,
      label: "E-POSTA",
      value: "randevu@luxebeauty.com.tr"
    },
    {
      icon: Clock,
      label: "ÇALIŞMA SAATLERİ",
      value: "Pzt–Cmt 09:00–20:00 · Pazar Kapalı"
    }
  ];

  return (
    <section id="iletisim" style={{ padding: "8rem 1.5rem", background: "var(--color-bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="contact-grid">
        
        {/* Left Side: Stylized Map */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "2rem", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9744158462!2d28.9926839!3d41.0494498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab70877093259%3A0x63353e68045d658c!2sTe%C5%9Fvikiye%20Cd.%20No%3A42%2C%20Te%C5%9Fvikiye%2C%2034365%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1715174000000!5m2!1str!2str"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(1) contrast(1.1) brightness(0.9) sepia(0.3)" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          {/* Map Overlay Label */}
          <div style={{ position: "absolute", top: "2rem", left: "2rem", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", padding: "0.6rem 1.2rem", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", background: "var(--color-gold)", borderRadius: "50%" }} />
            <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em" }}>NİŞANTAŞI, İSTANBUL</span>
          </div>
        </div>

        {/* Right Side: Contact Card */}
        <div style={{ background: "#fff", padding: "4rem", borderRadius: "2rem", boxShadow: "0 40px 100px rgba(0,0,0,0.06)", position: "relative" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-gold)", fontSize: "1.1rem", display: "block", marginBottom: "0.5rem" }}>
              İletişim bilgilerimiz
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
              {bookingLoading
                ? <span style={{ display: "inline-block", width: "260px", height: "1.2em", background: "#f0ece8", borderRadius: "6px" }} />
                : canBook ? "Randevu için bize ulaşın" : "Size özel teklif alın"}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "3.5rem" }}>
            {contactInfo.map((info, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(201, 169, 110, 0.08)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <info.icon size={20} style={{ color: "var(--color-gold-dark)" }} />
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-charcoal-muted)", display: "block", marginBottom: "0.25rem" }}>
                    {info.label}
                  </span>
                  <p style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.05rem", fontWeight: 500 }}>
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => openLeadModal()}
              style={{ 
                flex: 1,
                background: "var(--color-gold)", 
                color: "#fff", 
                border: "none", 
                padding: "1.2rem", 
                borderRadius: "999px", 
                fontWeight: 700, 
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 25px rgba(201, 169, 110, 0.3)"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Gift size={18} />
              SİZE ÖZEL TEKLİF
            </button>
            <button 
              onClick={openModal}
              style={{ 
                flex: 1,
                background: "transparent", 
                color: "var(--color-primary)", 
                border: "1px solid var(--color-gold)", 
                padding: "1.2rem", 
                borderRadius: "999px", 
                fontWeight: 700, 
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201, 169, 110, 0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {bookingLoading
                ? <span style={{ display: "inline-block", width: "100px", height: "1em", background: "rgba(255,255,255,0.5)", borderRadius: "4px" }} />
                : canBook ? "RANDEVU AL" : "TEKLİF TALEBİ OLUŞTUR"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .contact-grid > div:last-child {
            padding: 2.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .contact-grid div[style*="display: flex; gap: 1rem"] {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}
