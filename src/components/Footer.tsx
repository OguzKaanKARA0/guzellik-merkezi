"use client";

import { MapPin, Clock, Phone, AtSign, Globe, Mail, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";

export default function Footer() {
  const t = useTranslations("footer");
  const hours = t.raw("hours") as Array<{ day: string; time: string }>;
  const { openModal } = useBooking();

  const socialLinks = [
    { id: "footer-instagram", Icon: AtSign,  href: "https://instagram.com/luxebeauty",   label: "Instagram" },
    { id: "footer-facebook",  Icon: Globe,   href: "https://facebook.com/luxebeauty",    label: "Facebook"  },
    { id: "footer-mail",      Icon: Mail,    href: "mailto:info@luxebeauty.com",         label: "E-posta"   },
  ];

  return (
    <footer style={{ background: "var(--color-primary)", color: "var(--color-bg)", padding: "5rem 1.5rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Google Maps Embed */}
        <div style={{ marginBottom: "4rem", borderRadius: "1rem", overflow: "hidden", height: "300px", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.97451458925!2d28.9863483!3d41.0584555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zxa5pxZ9saS9Jc3RhbmJ1bA!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(40%) contrast(1.1) opacity(0.8)" }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Luxe Beauty Location"
          />
        </div>

        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "0.5px solid rgba(201,169,110,0.2)" }}>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={20} style={{ color: "var(--color-gold)" }} />
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                Luxe <span style={{ color: "var(--color-gold)" }}>Beauty</span>
              </span>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: "300px" }}>{t("tagline")}</p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              {socialLinks.map(({ id, Icon, href, label }) => (
                <a key={id} id={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.25s, border-color 0.25s, transform 0.2s", textDecoration: "none", color: "rgba(255,255,255,0.6)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.2)"; e.currentTarget.style.borderColor = "var(--color-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--color-gold)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-gold)" }}>{t("hoursTitle")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {hours.map(({ day, time }) => (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Clock size={14} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", flex: 1, gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{day}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, color: time === "Kapalı" || time === "Closed" ? "#f87171" : "rgba(255,255,255,0.8)" }}>{time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              id="footer-cta"
              onClick={openModal}
              className="btn-gold"
              style={{ fontSize: "0.78rem", padding: "0.65rem 1.5rem", marginTop: "0.5rem", width: "fit-content", cursor: "pointer", border: "none" }}
            >
              {t("bookBtn")}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>{t("copyright")}</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[t("privacy"), t("terms")].map((text) => (
              <a key={text} href="#" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{text}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; } }`}</style>
    </footer>
  );
}
