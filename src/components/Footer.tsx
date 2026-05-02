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
    <footer id="iletisim" style={{ background: "var(--color-charcoal)", color: "#fff", padding: "5rem 1.5rem 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>

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
                <a key={id} id={id} href={href} aria-label={label}
                  style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.25s, border-color 0.25s, transform 0.2s", textDecoration: "none", color: "rgba(255,255,255,0.6)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.2)"; e.currentTarget.style.borderColor = "var(--color-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--color-gold)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-gold)" }}>{t("contactTitle")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <MapPin size={16} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>{t("address")}</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Phone size={16} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                <a href="tel:+905001234567" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>+90 500 123 45 67</a>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Mail size={16} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                <a href="mailto:info@luxebeauty.com" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>info@luxebeauty.com</a>
              </div>
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
