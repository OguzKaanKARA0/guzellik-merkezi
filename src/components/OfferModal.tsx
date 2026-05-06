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
      className={`modal-overlay ${visible ? "visible" : ""}`}
      onClick={closeLeadModal}
    >
      <div
        className={`modal-container ${visible ? "animate-in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Border */}
        <div className="modal-accent" />

        <button
          className="modal-close"
          onClick={closeLeadModal}
          aria-label="Kapat"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {showSuccess ? (
          <div className="success-content">
            <div className="success-icon">
              <Check size={32} color="#fff" strokeWidth={3} />
            </div>
            <h2 className="serif-title">Talebiniz Kaydedildi</h2>
            <p className="success-desc">
              Bilgileriniz başarıyla alındı. <br /> WhatsApp&apos;a yönlendiriliyorsunuz...
            </p>
            <Loader2 className="spin" size={24} style={{ color: "var(--color-gold)", marginTop: "1rem" }} />
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="icon-badge">
                <MessageCircle size={28} strokeWidth={1.2} />
              </div>
              <h2 className="serif-title">Size Özel Teklif</h2>
              <p className="header-desc">
                Lütfen bilgilerinizi bırakın. Uzmanlarımız {selectedService || leadService ? <span className="gold-text">{selectedService || leadService}</span> : "hizmetlerimiz"} için size en uygun teklifi hazırlasın.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="offer-form">
              <div className="input-group">
                <label className="input-label">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                  placeholder="Adınızı giriniz"
                  className={`styled-input ${errors.name ? "error" : ""}`}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  placeholder="05XX XXX XX XX"
                  className={`styled-input ${errors.phone ? "error" : ""}`}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Hizmet Seçimi</label>
                <div className="select-wrapper">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="styled-select"
                  >
                    <option value="">Hizmet Seçiniz</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={18} className="select-icon" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? <Loader2 className="spin" size={20} /> : (
                  <>
                    Talebi Gönder <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="disclaimer">
              Verileriniz KVKK kapsamında korunmaktadır.
            </p>
          </>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(20, 18, 14, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          padding: 1.5rem;
        }
        .modal-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .modal-container {
          width: 100%;
          max-width: 420px;
          background-color: var(--color-bg);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 169, 110, 0.1);
          display: flex;
          flex-direction: column;
          transform: scale(0.95) translateY(30px);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          padding: 3rem 2rem;
          border: 0.5px solid rgba(201, 169, 110, 0.2);
        }
        .modal-container.animate-in {
          transform: scale(1) translateY(0);
        }

        .modal-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, var(--color-gold-dark), var(--color-gold), var(--color-gold-light));
        }

        .modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(201, 169, 110, 0.05);
          border: 1px solid rgba(201, 169, 110, 0.1);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          cursor: pointer;
          color: var(--color-charcoal-muted);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close:hover {
          background: rgba(201, 169, 110, 0.15);
          color: var(--color-primary);
          transform: rotate(90deg);
        }

        .success-content {
          text-align: center;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--color-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(201, 169, 110, 0.3);
        }
        .success-desc {
          color: var(--color-charcoal-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .modal-header {
          text-align: center;
          marginBottom: 2rem;
        }
        .icon-badge {
          display: inline-flex;
          padding: 0.85rem;
          border-radius: 50%;
          background-color: rgba(201, 169, 110, 0.08);
          color: var(--color-gold);
          margin-bottom: 1.25rem;
        }
        .serif-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: var(--color-primary);
          margin: 0 0 0.5rem 0;
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        .header-desc {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--color-charcoal-muted);
          margin: 0;
          line-height: 1.6;
          font-weight: 300;
        }
        .gold-text {
          color: var(--color-gold-dark);
          font-weight: 500;
        }

        .offer-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 2rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .input-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--color-gold-dark);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding-left: 0.2rem;
        }
        .styled-input, .styled-select {
          width: 100%;
          min-height: 48px;
          padding: 0 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(201, 169, 110, 0.2);
          background-color: #fff;
          font-size: 0.95rem;
          color: var(--color-charcoal);
          outline: none;
          font-family: var(--font-sans);
          transition: all 0.3s ease;
        }
        .styled-input:focus, .styled-select:focus {
          border-color: var(--color-gold);
          box-shadow: 0 4px 15px rgba(201, 169, 110, 0.12);
        }
        .styled-input.error {
          border-color: #ef4444;
        }
        .error-text {
          font-size: 0.7rem;
          color: #ef4444;
          padding-left: 0.2rem;
        }

        .select-wrapper {
          position: relative;
        }
        .styled-select {
          appearance: none;
          cursor: pointer;
        }
        .select-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gold);
          pointer-events: none;
        }

        .submit-btn {
          margin-top: 0.75rem;
          min-height: 52px;
          padding: 0 1.5rem;
          font-size: 0.85rem;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          background: var(--color-gold);
          color: #fff;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(201, 169, 110, 0.25);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(201, 169, 110, 0.35);
          background: var(--color-gold-dark);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .disclaimer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.7rem;
          color: var(--color-charcoal-muted);
          font-weight: 300;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
            align-items: flex-end;
          }
          .modal-container {
            max-width: 100%;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            padding: 2.5rem 1.5rem 3.5rem;
            transform: translateY(100%);
          }
          .modal-container.animate-in {
            transform: translateY(0);
          }
          .serif-title {
            font-size: 1.5rem;
          }
          .header-desc {
            font-size: 0.85rem;
          }
          .styled-input, .styled-select {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
