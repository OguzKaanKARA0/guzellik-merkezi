"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";

const WHATSAPP_NUMBER = "905001234567"; // Başına 90 ekle, 0 olmadan

export default function WhatsAppButton() {
  const locale = useLocale();

  const message = locale === "tr"
    ? "Merhaba, Luxe Beauty'den randevu almak istiyorum."
    : "Hello, I would like to book an appointment at Luxe Beauty.";

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-btn"
      aria-label="WhatsApp ile iletişim"
      style={{
        position:   "fixed",
        bottom:     "1.75rem",
        right:      "1.75rem",
        zIndex:     8000,
        width:      "58px",
        height:     "58px",
        borderRadius: "9999px",
        background: "linear-gradient(135deg, #25D366, #128C7E)",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:  "0 6px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.12) translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 32px rgba(37,211,102,0.55), 0 4px 12px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15)";
      }}
    >
      <MessageCircle size={26} fill="#fff" style={{ color: "#fff" }} />

      {/* Pulse ring animasyonu */}
      <span style={{
        position: "absolute",
        inset:    "-4px",
        borderRadius: "9999px",
        border:   "2px solid rgba(37,211,102,0.4)",
        animation: "wa-pulse 2s ease-out infinite",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          70%  { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
