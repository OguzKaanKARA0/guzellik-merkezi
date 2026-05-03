"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { X, Loader2, ArrowRight } from "lucide-react";
import { createLead } from "@/app/actions/leads";

const WHATSAPP_NUMBER = "905001234567";

export default function LeadCaptureModal() {
  const { isLeadModalOpen, leadService, closeLeadModal } = useBooking();
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLeadModalOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        setName("");
        setPhone("");
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLeadModalOpen]);

  if (!isLeadModalOpen && !visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createLead(name, phone, leadService);
    setLoading(false);

    if (result.success) {
      closeLeadModal();
      const message = `Merhaba, ben ${name}. ${leadService ? leadService + " hizmetiniz " : ""}hakkında özel teklifinizi almak istiyorum.`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(20, 18, 14, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.4s ease, visibility 0.4s ease",
        padding: "1.5rem"
      }}
      onClick={closeLeadModal}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "var(--color-bg)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative",
          padding: "3rem 2.5rem"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeLeadModal}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-charcoal-muted)",
            transition: "color 0.2s ease, transform 0.2s ease",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.transform = "scale(1.1) rotate(90deg)" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-charcoal-muted)"; e.currentTarget.style.transform = "scale(1) rotate(0deg)" }}
          aria-label="Close"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: "0 0 0.5rem 0", fontWeight: 400 }}>
            Size Özel Teklif
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--color-charcoal-muted)", margin: 0, lineHeight: 1.5 }}>
            Uzmanlarımızdan {leadService ? `"${leadService}" için ` : ""}kişiselleştirilmiş bilgi almak üzere bilgilerinizi girin. Sizi doğrudan WhatsApp'a yönlendireceğiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Adınız</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınızı giriniz"
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(212,175,55,0.3)",
                backgroundColor: "#fff",
                fontSize: "1rem",
                color: "var(--color-charcoal)",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Telefon</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(212,175,55,0.3)",
                backgroundColor: "#fff",
                fontSize: "1rem",
                color: "var(--color-charcoal)",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name || !phone}
            className="btn-gold"
            style={{ 
              marginTop: "1rem", 
              padding: "1rem", 
              fontSize: "1rem", 
              width: "100%", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: "0.5rem",
              opacity: (loading || !name || !phone) ? 0.7 : 1,
              cursor: (loading || !name || !phone) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? <Loader2 className="spin" size={18} /> : (
              <>
                WhatsApp'a Geç <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
