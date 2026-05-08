"use client";

import { Music, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

// --- Custom Social Icons (SVG) ---
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export default function Footer() {
  const t = useTranslations("footer");
  const { openModal, openServiceDetails } = useBooking();
  const pathname = usePathname();

  const currentLocale =
    routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
    routing.defaultLocale;

  const sections = [
    {
      title: currentLocale === "tr" ? "HİZMETLER" : "SERVICES",
      links: [
        { label: currentLocale === "tr" ? "Saç Tasarımı" : "Hair Design", onClick: () => openServiceDetails("hair") },
        { label: currentLocale === "tr" ? "Premium Cilt Bakımı" : "Premium Skin Care", onClick: () => openServiceDetails("skin") },
        { label: currentLocale === "tr" ? "Kişiye Özel Makyaj" : "Custom Makeup", onClick: () => openServiceDetails("makeup") },
        { label: currentLocale === "tr" ? "Manikür & Pedikür" : "Manicure & Pedicure", onClick: () => openServiceDetails("nails") },
        { label: currentLocale === "tr" ? "Kaş Tasarımı" : "Eyebrow Design", onClick: () => openServiceDetails("brows") },
        { label: currentLocale === "tr" ? "Kalıcı Makyaj" : "Permanent Makeup", onClick: () => openServiceDetails("permanent") },
      ]
    },
    {
      title: currentLocale === "tr" ? "KURUMSAL" : "CORPORATE",
      links: [
        { label: currentLocale === "tr" ? "Hakkımızda" : "About Us", href: "#hakkimizda" },
        { label: currentLocale === "tr" ? "Ekibimiz" : "Our Team" },
        { label: currentLocale === "tr" ? "Kariyer" : "Careers" },
      ]
    },
    {
      title: currentLocale === "tr" ? "YARDIM" : "HELP",
      links: [
        { label: currentLocale === "tr" ? "Randevu Al" : "Book Now", onClick: openModal },
        { label: currentLocale === "tr" ? "SSS" : "FAQ", href: "#faq" },
        { label: currentLocale === "tr" ? "Gizlilik" : "Privacy" },
        { label: currentLocale === "tr" ? "Şartlar" : "Terms" },
      ]
    }
  ];

  const socialLinks = [
    { id: "footer-instagram", Icon: InstagramIcon, href: "#" },
    { id: "footer-facebook",  Icon: FacebookIcon,  href: "#" },
    { id: "footer-tiktok",    Icon: TikTokIcon,    href: "#" },
  ];

  return (
    <footer style={{ background: "var(--color-primary)", color: "#FAF7F2", padding: "6rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid" style={{ 
          display: "grid", 
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr", 
          gap: "4rem",
          marginBottom: "5rem"
        }}>
          
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Sparkles size={24} style={{ color: "var(--color-gold)" }} />
              <span style={{ 
                fontFamily: "var(--font-serif)", 
                fontSize: "1.85rem", 
                fontWeight: 600, 
                letterSpacing: "0.02em" 
              }}>
                Luxe <span style={{ color: "var(--color-gold)", fontStyle: "italic", fontWeight: 400 }}>Beauty</span>
              </span>
            </div>
            
            <p style={{ 
              fontSize: "1rem", 
              lineHeight: 1.7, 
              color: "rgba(250, 247, 242, 0.65)", 
              margin: 0, 
              maxWidth: "340px",
              fontWeight: 400
            }}>
              {currentLocale === "tr" 
                ? "Estetik ve teknolojinin buluşma noktası. Nişantaşı, İstanbul'da butik bir güzellik deneyimi."
                : "Where aesthetics meets technology. A boutique beauty experience in Nişantaşı, Istanbul."}
            </p>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              {socialLinks.map(({ id, Icon, href }) => (
                <a key={id} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ 
                    width: "44px", 
                    height: "44px", 
                    borderRadius: "50%", 
                    border: "1px solid rgba(250, 247, 242, 0.15)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "rgba(250, 247, 242, 0.7)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-gold)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-gold)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "rgba(201, 169, 110, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(250, 247, 242, 0.15)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(250, 247, 242, 0.7)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {sections.map((section) => (
            <div key={section.title} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h3 style={{ 
                fontSize: "0.85rem", 
                fontWeight: 700, 
                letterSpacing: "0.15em", 
                color: "var(--color-gold)",
                margin: 0
              }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button 
                        onClick={link.onClick}
                        style={{ 
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontSize: "0.95rem", 
                          color: "rgba(250, 247, 242, 0.6)",
                          transition: "color 0.2s ease",
                          textAlign: "left"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#FAF7F2")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(250, 247, 242, 0.6)")}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.href}
                        style={{ 
                          textDecoration: "none", 
                          fontSize: "0.95rem", 
                          color: "rgba(250, 247, 242, 0.6)",
                          transition: "color 0.2s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#FAF7F2")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(250, 247, 242, 0.6)")}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          paddingTop: "2rem", 
          borderTop: "1px solid rgba(250, 247, 242, 0.1)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          fontSize: "0.8rem",
          color: "rgba(250, 247, 242, 0.4)"
        }}>
          <p style={{ margin: 0 }}>{t("copyright")}</p>
          <div style={{ display: "flex", gap: "2rem" }}>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>{t("privacy")}</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>{t("terms")}</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 968px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 3rem !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
