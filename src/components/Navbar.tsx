"use client";

import { useState } from "react";
import { Menu, X, Sparkles, Globe, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { useBooking } from "@/context/BookingContext";
import { useFeature } from "@/hooks/useFeature";

export default function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const [open, setOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openModal, openServiceDetails } = useBooking();
  const { value: canBook, loading: bookingLoading } = useFeature('booking');

  const currentLocale =
    routing.locales.find((l) => pathname.startsWith(`/${l}`)) ??
    routing.defaultLocale;

  const switchLocale = (next: string) => {
    const withoutLocale = pathname.replace(/^\/(tr|en)/, "") || "/";
    router.push(`/${next}${withoutLocale}`);
  };

  const links = [
    { href: `/${currentLocale}#hizmetler`, label: t("services") },
    { href: `/${currentLocale}#galeri`,    label: t("gallery")  },
    { href: `/${currentLocale}#faq`,       label: t("faq")      },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(250, 247, 242, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "0.5px solid rgba(201, 169, 110, 0.3)",
        /* ── Prevent vertical layout shift ── */
        minHeight: "72px",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          /* ── Items always centred, no jump on content change ── */
          flexWrap: "nowrap",
        }}
      >
        {/* Logo */}
        <a
          href={`/${currentLocale}`}
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} style={{ color: "var(--color-gold)" }} />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--color-charcoal)",
              letterSpacing: "0.04em",
            }}
          >
            Luxe <span style={{ color: "var(--color-gold)" }}>Beauty</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div
          className="nav-desktop"
          style={{ display: "flex", alignItems: "center", gap: "2rem", flexShrink: 0 }}
        >
          {links.map((l) => {
            if (l.label === t("services")) {
              return (
                <div key={l.href} style={{ position: "relative" }} className="nav-dropdown-container">
                  <a
                    href={l.href}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      color: "var(--color-charcoal-light)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-charcoal-light)")}
                  >
                    {l.label}
                  </a>
                  <div className="nav-dropdown" style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%) translateY(-10px)",
                    paddingTop: "1.5rem",
                    opacity: 0,
                    visibility: "hidden",
                    transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.4s",
                    zIndex: 100,
                  }}>
                    <div style={{
                      backgroundColor: "rgba(250, 247, 242, 0.8)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "0.5px solid rgba(201, 169, 110, 0.2)",
                      borderRadius: "0.75rem",
                      padding: "1rem",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      minWidth: "220px"
                    }}>
                      {[
                        { id: "hair", label: tServices("hair") },
                        { id: "skin", label: tServices("skin") },
                        { id: "makeup", label: tServices("makeup") },
                        { id: "nails", label: tServices("nails") },
                        { id: "brows", label: tServices("brows") },
                        { id: "permanent", label: tServices("permanent") }
                      ].map(svc => (
                        <button
                          key={svc.id}
                          onClick={() => openServiceDetails(svc.id)}
                          style={{
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            borderLeft: "2px solid transparent",
                            padding: "0.6rem 1rem",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontFamily: "var(--font-sans)",
                            color: "var(--color-charcoal)",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => { 
                            e.currentTarget.style.color = "var(--color-gold)"; 
                            e.currentTarget.style.borderLeftColor = "var(--color-gold)"; 
                            e.currentTarget.style.background = "rgba(212,175,55,0.05)"; 
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.color = "var(--color-charcoal)"; 
                            e.currentTarget.style.borderLeftColor = "transparent"; 
                            e.currentTarget.style.background = "none"; 
                          }}
                        >
                          {svc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: "var(--color-charcoal-light)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-gold)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-charcoal-light)")}
              >
                {l.label}
              </a>
            );
          })}

          {/* ── Language Switcher ── */}
          <LanguageSwitcher current={currentLocale} onSwitch={switchLocale} />

          <button
            id="nav-cta"
            onClick={openModal}
            className="btn-gold"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", border: "none" }}
          >
            {bookingLoading
              ? <span style={{ display: "inline-block", width: "60px", height: "0.85em", background: "rgba(255,255,255,0.4)", borderRadius: "3px", verticalAlign: "middle" }} />
              : canBook ? t("bookBtn") : "Teklif Al"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-charcoal)",
            flexShrink: 0,
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            background: "var(--color-bg)",
            borderTop: "0.5px solid rgba(201, 169, 110, 0.3)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {links.map((l) => {
            if (l.label === t("services")) {
              return (
                <div key={l.href} style={{ display: "flex", flexDirection: "column" }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsServicesOpen(!isServicesOpen);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--color-charcoal)",
                      background: "none",
                      border: "none",
                      padding: "0.5rem 0",
                      cursor: "pointer",
                      width: "100%",
                      fontFamily: "var(--font-sans)"
                    }}
                  >
                    {l.label}
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: isServicesOpen ? "rotate(180deg)" : "rotate(0deg)", 
                        transition: "transform 0.3s ease",
                        color: "var(--color-gold)"
                      }} 
                    />
                  </button>
                  
                  <div style={{
                    maxHeight: isServicesOpen ? "500px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                    opacity: isServicesOpen ? 1 : 0,
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "1rem",
                    borderLeft: "1px solid rgba(201, 169, 110, 0.2)",
                    marginTop: isServicesOpen ? "0.5rem" : "0",
                    gap: "0.5rem"
                  }}>
                    {[
                      { id: "hair", label: tServices("hair") },
                      { id: "skin", label: tServices("skin") },
                      { id: "makeup", label: tServices("makeup") },
                      { id: "nails", label: tServices("nails") },
                      { id: "brows", label: tServices("brows") },
                      { id: "permanent", label: tServices("permanent") }
                    ].map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => {
                          setOpen(false);
                          setIsServicesOpen(false);
                          openServiceDetails(svc.id);
                        }}
                        style={{
                          textAlign: "left",
                          padding: "0.75rem 0",
                          fontSize: "0.95rem",
                          color: "var(--color-charcoal-light)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)"
                        }}
                      >
                        {svc.label}
                      </button>
                    ))}
                    <a
                      href={`/${currentLocale}#hizmetler`}
                      onClick={() => {
                        setOpen(false);
                        setIsServicesOpen(false);
                      }}
                      style={{
                        padding: "0.75rem 0",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-gold)",
                        textDecoration: "none",
                        fontFamily: "var(--font-sans)",
                        borderTop: "0.5px solid rgba(201, 169, 110, 0.1)",
                        marginTop: "0.5rem"
                      }}
                    >
                      {currentLocale === "tr" ? "Tüm Hizmetler" : "All Services"}
                    </a>
                  </div>
                </div>
              );
            }
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--color-charcoal)",
                  textDecoration: "none",
                  padding: "0.5rem 0"
                }}
              >
                {l.label}
              </a>
            );
          })}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "0.5px solid rgba(201, 169, 110, 0.3)",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-charcoal-muted)",
                letterSpacing: "0.06em",
              }}
            >
              Language:
            </span>
            <LanguageSwitcher current={currentLocale} onSwitch={switchLocale} />
          </div>

          <button
            id="nav-mobile-cta"
            onClick={() => { setOpen(false); openModal(); }}
            className="btn-gold"
            style={{ textAlign: "center", cursor: "pointer", border: "none", width: "100%" }}
          >
            {bookingLoading
              ? <span style={{ display: "inline-block", width: "60px", height: "0.85em", background: "rgba(255,255,255,0.4)", borderRadius: "3px", verticalAlign: "middle" }} />
              : canBook ? t("bookBtn") : "Teklif Al"}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .nav-desktop    { display: none !important; } }
        @media (min-width: 769px) { .nav-mobile-btn { display: none !important; } }
        .nav-dropdown-container:hover .nav-dropdown {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateX(-50%) translateY(0) !important;
        }
      `}</style>
    </header>
  );
}

/* ────────────────────────────────────────────────
   Language Switcher — gold pill, no layout shift
   ──────────────────────────────────────────────── */
function LanguageSwitcher({
  current,
  onSwitch,
}: {
  current: string;
  onSwitch: (locale: string) => void;
}) {
  return (
    <div
      aria-label="Language selector"
      style={{
        display: "inline-flex",
        alignItems: "center",
        /* ── Fixed width so the pill never resizes ── */
        width: "88px",
        height: "34px",
        borderRadius: "9999px",
        border: "1.5px solid var(--color-gold)",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 0 0 0 rgba(212,175,55,0)",
        transition: "box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 3px rgba(212,175,55,0.18)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 0 0 rgba(212,175,55,0)")
      }
    >
      {/* Globe icon — fixed width so buttons don't shift */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "26px",
          flexShrink: 0,
        }}
      >
        <Globe size={12} style={{ color: "var(--color-gold)" }} />
      </span>

      {(["tr", "en"] as const).map((locale, i) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            id={`lang-btn-${locale}`}
            onClick={() => !active && onSwitch(locale)}
            aria-pressed={active}
            aria-label={`Switch to ${locale.toUpperCase()}`}
            style={{
              /* ── Fixed width per button — eliminates layout shift ── */
              width: "31px",
              flexShrink: 0,
              height: "100%",
              fontSize: "0.68rem",
              fontWeight: active ? 800 : 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: active ? "default" : "pointer",
              border: "none",
              borderLeft: i === 0 ? "1px solid rgba(212,175,55,0.3)" : "none",
              /* Active: solid gold fill; Inactive: transparent */
              background: active
                ? "linear-gradient(135deg, var(--color-gold-dark), var(--color-gold), var(--color-gold-light))"
                : "transparent",
              color: active ? "#fff" : "var(--color-gold)",
              transition: "background 0.22s ease, color 0.22s ease, font-weight 0.1s",
              /* Crisp shadow on active tab for depth */
              boxShadow: active ? "inset 0 1px 2px rgba(0,0,0,0.15)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "rgba(212,175,55,0.14)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
