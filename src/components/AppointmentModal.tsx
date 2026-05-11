"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Check, Loader2, ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { useFeature } from "@/hooks/useFeature";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────
   New 3-Step Appointment Modal
   Step 1: Service Selection
   Step 2: Date & Time Selection
   Step 3: Personal Information
───────────────────────────────────────────────────────── */

const serviceOptions = [
  { id: "hair",      name: "Saç Tasarımı",   img: "/gallery/service_hair.png" },
  { id: "skin",      name: "Cilt Bakımı",    img: "/gallery/service_skin.png" },
  { id: "makeup",    name: "Makyaj",         img: "/gallery/service_makeup.png" },
  { id: "nails",     name: "Tırnak",         img: "/gallery/service_nails.png" },
  { id: "brows",     name: "Kaş & Kirpik",   img: "/gallery/service_brows.png" },
  { id: "permanent", name: "Kalıcı Oje",     img: "/gallery/service_permanent.png" },
];

export default function AppointmentModal() {
  const t = useTranslations("modal");
  const locale = useLocale();
  const { isOpen, closeModal } = useBooking();
  const { value: canBook } = useFeature('booking');

  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // Selection State
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", phone: "", email: "", note: "" });
  
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  const times = t.raw("times") as string[];

  const dateScrollRef = useRef<HTMLDivElement>(null);

  const scrollDates = (direction: "left" | "right") => {
    if (dateScrollRef.current) {
      const scrollAmount = dateScrollRef.current.clientWidth;
      dateScrollRef.current.scrollBy({ 
        left: direction === "right" ? scrollAmount : -scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  // Transition & Body Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        setStep(1);
        setStatus("idle");
        setSelectedService("");
        setSelectedDate("");
        setSelectedTime("");
        setUserInfo({ name: "", phone: "", email: "", note: "" });
        setFormErrors({});
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fetch Booked Times
  useEffect(() => {
    if (!selectedDate) return;
    const fetchTimes = async () => {
      setIsFetchingTimes(true);
      try {
        const res = await fetch(`/api/get-booked-times?date=${selectedDate}`);
        const data = await res.json();
        if (data.ok) setBookedTimes(data.bookedTimes);
      } catch (err) {
        console.error("Error fetching booked times:", err);
      } finally {
        setIsFetchingTimes(false);
      }
    };
    fetchTimes();
  }, [selectedDate]);

  const handleNext = () => {
    if (step === 1 && !selectedService) return;
    if (step === 2 && (!selectedDate || !selectedTime)) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) closeModal();
    else setStep(step - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Validation
    const newErrors: { name?: string; phone?: string } = {};
    if (userInfo.name.length < 3) newErrors.name = "Geçerli bir isim giriniz.";
    if (userInfo.phone.length < 10) newErrors.phone = "Geçerli bir telefon giriniz.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          ...userInfo,
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  if (!isOpen && !visible) return null;

  return (
    <div
      onClick={closeModal}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: visible ? "rgba(20, 18, 14, 0.7)" : "rgba(20, 18, 14, 0)",
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
        transition: "all 0.4s ease",
        padding: "1rem"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "var(--color-bg)",
          borderRadius: "2rem",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          overflow: "hidden",
          transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative"
        }}
      >
        {/* Step Indicator (Progress Bar) */}
        <div style={{ display: "flex", gap: "0.5rem", padding: "1.5rem 2.5rem 0" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "3px",
                background: s <= step ? "var(--color-gold)" : "rgba(201, 169, 110, 0.15)",
                borderRadius: "99px",
                transition: "all 0.5s ease"
              }}
            />
          ))}
        </div>

        <div style={{ padding: "2.5rem" }}>
          {/* Top Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div>
              {canBook && (
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
                  ADIM {step} / 3
                </p>
              )}
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
                {status === "success" ? "Teşekkürler" : canBook ? "Randevu Oluştur" : "Teklif Talebi Oluştur"}
              </h2>
            </div>
            <button
              onClick={closeModal}
              style={{ background: "rgba(201,169,110,0.1)", border: "none", borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={20} />
            </button>
          </div>

          {!canBook ? (
            <OfferForm closeModal={closeModal} />
          ) : status === "success" ? (
             <SuccessContent closeModal={closeModal} />
          ) : (
            <>
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <div className="step-content">
                  <p style={{ fontSize: "1.05rem", color: "var(--color-charcoal-muted)", marginBottom: "1.75rem", fontWeight: 400 }}>Hangi hizmet için geleceksiniz?</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {serviceOptions.map((s) => {
                      const isSel = selectedService === s.name;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.name)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1.25rem",
                            padding: "1rem 1.25rem",
                            background: isSel ? "rgba(201, 169, 110, 0.05)" : "#fff",
                            border: `1px solid ${isSel ? "var(--color-gold)" : "rgba(201, 169, 110, 0.15)"}`,
                            borderRadius: "1.25rem",
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                            textAlign: "left",
                            position: "relative",
                            boxShadow: isSel ? "0 10px 25px rgba(201, 169, 110, 0.15)" : "0 2px 10px rgba(0,0,0,0.02)"
                          }}
                        >
                          <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "1rem", overflow: "hidden", flexShrink: 0, border: `1px solid ${isSel ? "var(--color-gold)" : "transparent"}` }}>
                            <Image src={s.img} alt={s.name} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ 
                              fontSize: "0.95rem", 
                              color: isSel ? "var(--color-primary)" : "var(--color-charcoal)", 
                              fontWeight: isSel ? 600 : 500,
                              display: "block" 
                            }}>
                              {s.name}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-charcoal-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.2rem", display: "block" }}>
                              Luxe Service
                            </span>
                          </div>
                          {isSel && (
                            <div style={{ 
                              width: "22px", 
                              height: "22px", 
                              borderRadius: "50%", 
                              background: "var(--color-gold)", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              position: "absolute",
                              right: "1rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              boxShadow: "0 4px 10px rgba(201,169,110,0.4)"
                            }}>
                              <Check size={14} color="#fff" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="step-content">
                  <div style={{ marginBottom: "2.5rem" }}>
                    <p style={{ fontSize: "1.1rem", color: "var(--color-charcoal-muted)", marginBottom: "1.2rem" }}>Tarih seçin</p>
                    <div style={{ position: "relative" }}>
                      
                      {/* Left Gradient & Button */}
                      <div style={{ position: "absolute", left: "-1.25rem", top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, var(--color-bg), transparent)", zIndex: 10, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                        <button 
                          onClick={() => scrollDates("left")}
                          style={{
                            pointerEvents: "auto",
                            background: "#fff",
                            border: "1px solid rgba(201,169,110,0.2)",
                            borderRadius: "50%",
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            color: "var(--color-gold)"
                          }}
                        >
                          <ChevronDown size={20} style={{ transform: "rotate(90deg)" }} />
                        </button>
                      </div>

                      <div 
                        ref={dateScrollRef}
                        style={{ 
                          display: "flex", 
                          gap: "0.75rem", 
                          overflowX: "auto", 
                          padding: "0 2rem 1rem", 
                          scrollbarWidth: "none", 
                          msOverflowStyle: "none",
                          scrollBehavior: "smooth"
                        }} 
                        className="date-scroll"
                      >
                        {Array.from({ length: 14 }).map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() + i);
                          const dateStr = d.toISOString().split("T")[0];
                          const isSelected = selectedDate === dateStr;
                          const dayName = i === 0 ? "BUGÜN" : d.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase();
                          const dayNum = d.getDate();
                          const monthName = d.toLocaleDateString("tr-TR", { month: "short" });

                          return (
                            <button
                              key={dateStr}
                              onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                              style={{
                                flex: "0 0 calc((100% - (4 * 0.75rem)) / 5)",
                                minWidth: "90px",
                                height: "115px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "1.5rem",
                                border: `1.5px solid ${isSelected ? "var(--color-gold)" : "rgba(201, 169, 110, 0.05)"}`,
                                background: isSelected ? "var(--color-gold)" : "#fff",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: isSelected ? "0 10px 20px rgba(201, 169, 110, 0.2)" : "0 2px 8px rgba(0,0,0,0.02)"
                              }}
                            >
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: isSelected ? "#fff" : "var(--color-gold-dark)", marginBottom: "0.3rem" }}>{dayName}</span>
                              <span style={{ fontSize: "1.6rem", fontWeight: 500, color: isSelected ? "#fff" : "var(--color-primary)", lineHeight: 1 }}>{dayNum}</span>
                              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.8)" : "var(--color-charcoal-muted)", marginTop: "0.3rem" }}>{monthName}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Right Gradient & Button */}
                      <div style={{ position: "absolute", right: "-1.25rem", top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, var(--color-bg), transparent)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", pointerEvents: "none" }}>
                        <button 
                          onClick={() => scrollDates("right")}
                          style={{
                            pointerEvents: "auto",
                            background: "#fff",
                            border: "1px solid rgba(201,169,110,0.2)",
                            borderRadius: "50%",
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            color: "var(--color-gold)"
                          }}
                        >
                          <ChevronDown size={20} style={{ transform: "rotate(-90deg)" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ opacity: selectedDate ? 1 : 0.5, pointerEvents: selectedDate ? "auto" : "none" }}>
                    <p style={{ fontSize: "1.1rem", color: "var(--color-charcoal-muted)", marginBottom: "1.2rem" }}>Saat seçin</p>
                    {isFetchingTimes ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "2rem", color: "var(--color-gold)" }}>
                        <Loader2 className="spin" size={20} />
                        <span>Müsaitlik kontrol ediliyor...</span>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                        {times.map((h) => {
                          const isBooked = bookedTimes.includes(h);
                          const isSel = selectedTime === h;
                          return (
                            <button
                              key={h}
                              disabled={isBooked}
                              onClick={() => setSelectedTime(h)}
                              style={{
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: `1.5px solid ${isSel ? "var(--color-gold)" : "rgba(201, 169, 110, 0.1)"}`,
                                background: isSel ? "rgba(201, 169, 110, 0.05)" : "#fff",
                                fontSize: "1rem",
                                fontWeight: isSel ? 700 : 500,
                                color: isBooked ? "rgba(239, 68, 68, 0.3)" : "var(--color-primary)",
                                cursor: isBooked ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                opacity: isBooked ? 0.6 : 1,
                                position: "relative"
                              }}
                            >
                              {h}
                              {isBooked && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ width: "20px", height: "1px", background: "rgba(239, 68, 68, 0.5)", transform: "rotate(-45deg)" }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Info */}
              {step === 3 && (
                <div className="step-content">
                  <p style={{ fontSize: "1.1rem", color: "var(--color-charcoal-muted)", marginBottom: "2rem" }}>İletişim bilgileriniz</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                         <label style={labelStyle}>AD SOYAD</label>
                         <input style={{...inputStyle, borderColor: formErrors.name ? "#ef4444" : "rgba(201, 169, 110, 0.2)"}} value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} placeholder="Adınız" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                         <label style={labelStyle}>TELEFON</label>
                         <input style={{...inputStyle, borderColor: formErrors.phone ? "#ef4444" : "rgba(201, 169, 110, 0.2)"}} value={userInfo.phone} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})} placeholder="05XX XXX XX XX" />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                       <label style={labelStyle}>E-POSTA</label>
                       <input style={inputStyle} value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} placeholder="ornek@mail.com" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                       <label style={labelStyle}>NOTUNUZ (OPSİYONEL)</label>
                       <textarea style={{...inputStyle, height: "80px", resize: "none", padding: "1rem"}} value={userInfo.note} onChange={(e) => setUserInfo({...userInfo, note: e.target.value})} placeholder="Eklemek istediğiniz bir not var mı?" />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", borderTop: "1px solid rgba(201, 169, 110, 0.1)", paddingTop: "2.5rem" }}>
                <button
                  onClick={handleBack}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "999px",
                    border: "1px solid var(--color-gold)",
                    background: "transparent",
                    color: "var(--color-primary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  {step === 1 ? "VAZGEÇ" : "GERİ"}
                </button>
                <button
                  onClick={step === 3 ? handleSubmit : handleNext}
                  disabled={status === "loading" || (step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedTime))}
                  style={{
                    flex: 1,
                    padding: "1rem 2rem",
                    borderRadius: "999px",
                    background: "var(--color-gold)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    transition: "all 0.3s ease",
                    opacity: (step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedTime)) ? 0.5 : 1
                  }}
                >
                  {status === "loading" ? <Loader2 className="spin" size={18} /> : (
                    <>
                      {step === 3 ? "RANDEVUYU TAMAMLA" : "DEVAM ET"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .step-content div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const offerServices = [
  "Saç Tasarımı",
  "Cilt Bakımı",
  "Makyaj",
  "Tırnak",
  "Kaş & Kirpik",
  "Kalıcı Oje",
];

function OfferForm({ closeModal }: { closeModal: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", service: "", preference: "", note: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; service?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (form.name.length < 2) newErrors.name = "İsim giriniz.";
    if (form.phone.length < 10) newErrors.phone = "Geçerli telefon giriniz.";
    if (!form.service) newErrors.service = "Hizmet seçiniz.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const text = `Merhaba! Teklif almak istiyorum.\nİsim: ${form.name}\nHizmet: ${form.service}\nTercih: ${form.preference}\nNot: ${form.note}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: "1rem", color: "var(--color-charcoal-muted)", marginBottom: "2rem" }}>
        Size özel teklif hazırlayalım. Formu doldurun, WhatsApp üzerinden iletişime geçelim.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={labelStyle}>İSİM SOYAD *</label>
            <input
              style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "rgba(201,169,110,0.2)" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Adınız"
            />
            {errors.name && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.name}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={labelStyle}>TELEFON *</label>
            <input
              style={{ ...inputStyle, borderColor: errors.phone ? "#ef4444" : "rgba(201,169,110,0.2)" }}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="05XX XXX XX XX"
            />
            {errors.phone && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.phone}</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>İLGİLENDİĞİN HİZMET *</label>
          <select
            style={{ ...inputStyle, borderColor: errors.service ? "#ef4444" : "rgba(201,169,110,0.2)", cursor: "pointer" }}
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            <option value="">Seçiniz...</option>
            {offerServices.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.service && <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.service}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>TERCİH ETTİĞİN GÜN / SAAT</label>
          <input
            style={inputStyle}
            value={form.preference}
            onChange={(e) => setForm({ ...form, preference: e.target.value })}
            placeholder="Örn: Salı öğleden sonra"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>NOT (OPSİYONEL)</label>
          <textarea
            style={{ ...inputStyle, height: "80px", resize: "none", padding: "1rem" }}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Eklemek istediğiniz bir not var mı?"
          />
        </div>
      </div>
      <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", borderTop: "1px solid rgba(201,169,110,0.1)", paddingTop: "2rem" }}>
        <button
          type="button"
          onClick={closeModal}
          style={{ padding: "1rem 2rem", borderRadius: "999px", border: "1px solid var(--color-gold)", background: "transparent", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", cursor: "pointer" }}
        >
          VAZGEÇ
        </button>
        <button
          type="submit"
          style={{ flex: 1, padding: "1rem 2rem", borderRadius: "999px", background: "var(--color-gold)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}
        >
          <MessageCircle size={18} />
          WHATSAPP&apos;TAN GÖNDER
        </button>
      </div>
    </form>
  );
}

function SuccessContent({ closeModal }: { closeModal: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: "0 20px 40px rgba(201,169,110,0.3)" }}>
        <Check size={40} color="#fff" strokeWidth={3} />
      </div>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Randevunuz Alındı!</h3>
      <p style={{ color: "var(--color-charcoal-muted)", lineHeight: 1.6, marginBottom: "2.5rem" }}>Uzmanlarımız randevunuzu onaylamak için kısa süre içinde sizinle iletişime geçecektir.</p>
      <button onClick={closeModal} className="btn-gold" style={{ width: "100%", padding: "1.25rem" }}>TAMAM</button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.85rem 1.25rem",
  borderRadius: "0.75rem",
  border: "1.5px solid rgba(201, 169, 110, 0.2)",
  background: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  color: "var(--color-primary)",
  transition: "all 0.3s ease"
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "var(--color-gold-dark)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  paddingLeft: "0.25rem"
};
