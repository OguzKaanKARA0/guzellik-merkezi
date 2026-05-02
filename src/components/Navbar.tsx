"use client";

import { useState } from "react";
import { Menu, X, Sparkles, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { useBooking } from "@/context/BookingContext";

export default function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useBooking();

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
    { href: `/${currentLocale}#iletisim`,  label: t("contact")  },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255,253,208,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(212,175,55,0.18)",
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
          {links.map((l) => (
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
          ))}

          {/* ── Language Switcher ── */}
          <LanguageSwitcher current={currentLocale} onSwitch={switchLocale} />

          <button
            id="nav-cta"
            onClick={openModal}
            className="btn-gold"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", border: "none" }}
          >
            {t("bookBtn")}
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
            background: "var(--color-cream)",
            borderTop: "1px solid rgba(212,175,55,0.2)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--color-charcoal)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(212,175,55,0.2)",
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
            {t("bookBtn")}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .nav-desktop    { display: none !important; } }
        @media (min-width: 769px) { .nav-mobile-btn { display: none !important; } }
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
