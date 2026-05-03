"use client";

import { useEffect, useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { X, Loader2, ArrowRight, MessageCircle, ChevronDown, Check } from "lucide-react";
import { createLead } from "@/app/actions/leads";

const WHATSAPP_NUMBER = "905001234567";

export default function OfferModal() {
  const { isLeadModalOpen, leadService, closeLeadModal } = useBooking();
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const services = ["Saç Tasarımı", "Premium Cilt Bakımı", "Kişiye Özel Makyaj", "Manikür & Pedikür", "Kaş Tasarımı", "Kalıcı Makyaj"];

  useEffect(() => {
    if (leadService) {
      setSelectedService(leadService);
    }
  }, [leadService]);

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
        setSelectedService("");
        setLoading(false);
        setShowSuccess(false);
        setErrors({});
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLeadModalOpen]);

  if (!isLeadModalOpen && !visible) return null;

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    const phoneRegex = /^[0-9]+$/;

    if (!nameRegex.test(name) || name.trim().length < 3) {
      newErrors.name = "İsim en az 3 harf ve sadece harflerden oluşmalıdır.";
    }
    const cleanPhone = phone.replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Telefon sadece rakamlardan oluşmalıdır.";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = "Telefon numarası 10 veya 11 hane olmalıdır.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);

    const result = await createLead(name, phone, selectedService || leadService);
    setLoading(false);

    if (result.success) {
      setShowSuccess(true);
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        closeLeadModal();
        const message = `Merhaba, ben ${name}. ${selectedService || leadService ? (selectedService || leadService) + " hizmetiniz " : ""}için özel teklif almak istiyorum.`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }, 2000);
    } else {
      let friendlyError = "Bir hata oluştu. Lütfen tekrar deneyin.";
      if (result.error) {
        if (result.error.includes("Database error") || result.error.includes("Veritabanı")) {
          friendlyError = "Veritabanı bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.";
        } else {
          friendlyError = result.error;
        }
      }
      alert(`Hata: ${friendlyError}`);
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
        backgroundColor: "rgba(20, 18, 14, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.5s ease, visibility 0.5s ease",
        padding: "1.5rem"
      }}
      onClick={closeLeadModal}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--color-bg)",
          borderRadius: "0.5rem",
          overflow: "hidden",
          boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 169, 110, 0.2)",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(30px)",
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative",
          padding: "3.5rem 2.5rem",
          border: "0.5px solid rgba(201, 169, 110, 0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner element */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "linear-gradient(to right, var(--color-gold-dark), var(--color-gold), var(--color-gold-light))" }} />

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
            transition: "all 0.3s ease",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "rotate(90deg)" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-charcoal-muted)"; e.currentTarget.style.transform = "rotate(0deg)" }}
          aria-label="Kapat"
        >
          <X size={26} strokeWidth={1.2} />
        </button>

        {showSuccess ? (
          <div style={{ textAlign: "center", padding: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(201, 169, 110, 0.4)" }}>
              <Check size={40} color="#fff" strokeWidth={3} />
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Talebiniz Kaydedildi</h2>
            <p style={{ color: "var(--color-charcoal-muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Bilgileriniz başarıyla alındı. <br /> WhatsApp'a yönlendiriliyorsunuz...
            </p>
            <Loader2 className="spin" size={24} style={{ color: "var(--color-gold)", marginTop: "1rem" }} />
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", backgroundColor: "rgba(201, 169, 110, 0.1)", color: "var(--color-gold)", marginBottom: "1.5rem" }}>
                <MessageCircle size={32} strokeWidth={1.5} />
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", margin: "0 0 0.75rem 0", fontWeight: 400, letterSpacing: "-0.02em" }}>
                Size Özel Teklif
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--color-charcoal-muted)", margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                Lütfen bilgilerinizi bırakın. Uzmanlarımız {selectedService || leadService ? <span style={{ color: "var(--color-gold)", fontWeight: 500 }}>{selectedService || leadService}</span> : "hizmetlerimiz"} için size en uygun teklifi hazırlasın.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                  placeholder="Adınızı ve soyadınızı giriniz"
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem",
                    borderRadius: "0",
                    border: errors.name ? "1px solid #ef4444" : "1px solid rgba(201, 169, 110, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    fontSize: "1rem",
                    color: "var(--color-charcoal)",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-gold)"; e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(201, 169, 110, 0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? "#ef4444" : "rgba(201, 169, 110, 0.2)"; e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {errors.name && <span style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.2rem" }}>{errors.name}</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  placeholder="05XX XXX XX XX"
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem",
                    borderRadius: "0",
                    border: errors.phone ? "1px solid #ef4444" : "1px solid rgba(201, 169, 110, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    fontSize: "1rem",
                    color: "var(--color-charcoal)",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-gold)"; e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(201, 169, 110, 0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.phone ? "#ef4444" : "rgba(201, 169, 110, 0.2)"; e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {errors.phone && <span style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.2rem" }}>{errors.phone}</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gold-dark)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Hizmet Seçimi</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "1rem 1.25rem",
                      borderRadius: "0",
                      border: "1px solid rgba(201, 169, 110, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      fontSize: "1rem",
                      color: "var(--color-charcoal)",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <option value="">Hizmet Seçiniz</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={18} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-gold)", pointerEvents: "none" }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold"
                style={{ 
                  marginTop: "1.5rem", 
                  padding: "1.2rem", 
                  fontSize: "0.9rem", 
                  width: "100%", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? <Loader2 className="spin" size={20} /> : (
                  <>
                    Talebi Gönder & WP'ye Geç <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--color-charcoal-muted)", fontWeight: 300 }}>
          Bilgileriniz güvenle saklanır ve sadece teklif hazırlamak için kullanılır.
        </p>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
