"use client";

import { Check, Star, Zap, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

/* ─────────────────────────────────────────────────────────
   Pricing Section
   – 3 Tiers: Basic, Pro, AI
   – Luxe Aesthetic (Gold/Cream/Charcoal)
   – Responsive Grid
───────────────────────────────────────────────────────── */

export default function PricingSection() {
  const t = useTranslations("pricing");

  const plans = [
    {
      id: "basic",
      name: t("plans.basic.name"),
      price: t("plans.basic.price"),
      description: t("plans.basic.description"),
      features: t.raw("plans.basic.features") as string[],
      icon: Star,
      highlight: false,
    },
    {
      id: "pro",
      name: t("plans.pro.name"),
      price: t("plans.pro.price"),
      description: t("plans.pro.description"),
      features: t.raw("plans.pro.features") as string[],
      icon: Zap,
      highlight: true,
      tag: t("plans.pro.tag"),
    },
    {
      id: "ai",
      name: t("plans.ai.name"),
      price: t("plans.ai.price"),
      description: t("plans.ai.description"),
      features: t.raw("plans.ai.features") as string[],
      icon: Sparkles,
      highlight: false,
    },
  ];

  return (
    <section id="pricing" style={sectionStyle}>
      <div className="container" style={containerStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <p style={subTitleStyle}>{t("subtitle")}</p>
          <h2 style={titleStyle}>{t("title")}</h2>
          <div style={dividerStyle} />
        </div>

        {/* Grid */}
        <div className="pricing-grid" style={gridStyle}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              style={{
                ...cardStyle,
                ...(plan.highlight ? highlightedCardStyle : {}),
              }}
              className="pricing-card"
            >
              {plan.tag && (
                <div style={tagStyle}>{plan.tag}</div>
              )}
              
              <div style={iconContainerStyle}>
                <plan.icon size={24} style={{ color: plan.highlight ? "var(--color-cream)" : "var(--color-gold)" }} />
              </div>

              <h3 style={{
                ...planNameStyle,
                color: plan.highlight ? "var(--color-cream)" : "var(--color-charcoal)",
              }}>{plan.name}</h3>
              
              <div style={priceContainerStyle}>
                <span style={{
                  ...priceStyle,
                  color: plan.highlight ? "var(--color-cream)" : "var(--color-charcoal)",
                }}>{plan.price}</span>
                <span style={{
                  ...pricePeriodStyle,
                  color: plan.highlight ? "rgba(255,255,255,0.7)" : "var(--color-charcoal-muted)",
                }}>{t("perMonth")}</span>
              </div>

              <p style={{
                ...descriptionStyle,
                color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--color-charcoal-muted)",
              }}>{plan.description}</p>

              <ul style={featureListStyle}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={featureItemStyle}>
                    <Check size={16} style={{ 
                      color: plan.highlight ? "var(--color-gold-light)" : "var(--color-gold)",
                      flexShrink: 0 
                    }} />
                    <span style={{
                      fontSize: "0.9rem",
                      color: plan.highlight ? "rgba(255,255,255,0.9)" : "var(--color-charcoal)",
                    }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={plan.highlight ? "btn-gold-light" : "btn-gold"}
                style={buttonStyle}
              >
                {t("cta")}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        @media (max-width: 992px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }
        .pricing-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .btn-gold-light {
          background: var(--color-cream);
          color: var(--color-charcoal);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-gold-light:hover {
          background: #fff;
          transform: scale(1.02);
        }
      `}</style>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: "100px 0",
  background: "var(--color-cream-dark)",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 2rem",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "4rem",
};

const subTitleStyle: React.CSSProperties = {
  color: "var(--color-gold)",
  fontSize: "0.875rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  marginBottom: "0.5rem",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "2.5rem",
  color: "var(--color-charcoal)",
  marginBottom: "1.5rem",
};

const dividerStyle: React.CSSProperties = {
  width: "60px",
  height: "3px",
  background: "var(--color-gold)",
  margin: "0 auto",
};

const gridStyle: React.CSSProperties = {
  marginTop: "2rem",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  padding: "3rem 2rem",
  borderRadius: "1.5rem",
  border: "1px solid rgba(212,175,55,0.1)",
  display: "flex",
  flexDirection: "column",
  position: "relative",
};

const highlightedCardStyle: React.CSSProperties = {
  background: "var(--color-charcoal)",
  transform: "scale(1.05)",
  zIndex: 2,
  borderColor: "var(--color-gold)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};

const tagStyle: React.CSSProperties = {
  position: "absolute",
  top: "1.5rem",
  right: "1.5rem",
  background: "var(--color-gold)",
  color: "#fff",
  padding: "0.25rem 0.75rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
};

const iconContainerStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: "rgba(212,175,55,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1.5rem",
};

const planNameStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontFamily: "var(--font-serif)",
  marginBottom: "0.5rem",
};

const priceContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.25rem",
  marginBottom: "1rem",
};

const priceStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: 700,
};

const pricePeriodStyle: React.CSSProperties = {
  fontSize: "0.875rem",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: 1.6,
  marginBottom: "2rem",
};

const featureListStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0 0 2.5rem 0",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flexGrow: 1,
};

const featureItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "1rem",
  borderRadius: "0.75rem",
  fontSize: "1rem",
  fontWeight: 600,
};
