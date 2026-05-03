"use client";

import {
  useState, useEffect, useRef, FormEvent
} from "react";
import { X, Check, Phone, Clock, Star, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useBooking } from "@/context/BookingContext";
import { STATS } from "@/constants/stats";

/* ─────────────────────────────────────────────────────────
   Appointment Modal
   – Fully i18n (TR/EN)
   – POSTs to /api/send-booking on submit
   – Smooth enter/exit animation
───────────────────────────────────────────────────────── */
export default function AppointmentModal() {
  const t      = useTranslations("modal");
  const locale = useLocale();
  const { isOpen, closeModal } = useBooking();

  const [visible,   setVisible]   = useState(false);
  const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg,  setErrorMsg]  = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedTimes, setBookedTimes]   = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);

  /* ── Fetch booked times when selectedDate changes ── */
  useEffect(() => {
    if (!selectedDate) {
      requestAnimationFrame(() => setBookedTimes([]));
      return;
    }
    
    let isMounted = true;
    const fetchTimes = async () => {
      setIsFetchingTimes(true);
      try {
        const res = await fetch(`/api/get-booked-times?date=${selectedDate}`);
        const data = await res.json();
        if (isMounted && data.ok) {
          setBookedTimes(data.bookedTimes);
        }
      } catch (err) {
        console.error("Error fetching booked times:", err);
      } finally {
        if (isMounted) setIsFetchingTimes(false);
      }
    };
    
    fetchTimes();
    return () => { isMounted = false; };
  }, [selectedDate]);

  /* ── Transition + modern body-lock ── */
  useEffect(() => {
    if (isOpen) {
      // Sayfa zıplamasını önlemek için scrollbar genişliğini hesapla
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
      
      requestAnimationFrame(() => setVisible(true));
    } else {
      requestAnimationFrame(() => setVisible(false));
      const timer = setTimeout(() => {
        document.body.style.paddingRight = "";
        document.body.style.overflow     = "";
        
        setStatus("idle");
        setErrorMsg("");
        setFormErrors({});
        formRef.current?.reset();
        setSelectedDate("");
        setSelectedTime("");
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* ── ESC key closes modal ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  /* ── Form submit → /api/send-booking ── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const phone = fd.get("phone") as string;

    // Validation
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

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setStatus("idle");
      return;
    }

    const payload = {
      locale,
      name,
      phone,
      email:   fd.get("email")   as string,
      service: fd.get("service") as string,
      date:    fd.get("date")    as string,
      time:    fd.get("time")    as string,
      note:    fd.get("note")    as string,
    };

    try {
      const res = await fetch("/api/send-booking", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Sunucuyla iletişim kurulurken bir hata oluştu.");
      }
      setStatus("success");
    } catch (err) {
      console.error("[AppointmentModal] Submit Error:", err);
      setStatus("error");
      
      let friendlyMsg = "Bir hata oluştu, lütfen tekrar deneyin.";
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          friendlyMsg = "İnternet bağlantınızı kontrol edin.";
        } else {
          friendlyMsg = err.message;
        }
      }
      setErrorMsg(friendlyMsg);
    }
  };

  if (!isOpen && !visible) return null;

  const services  = t.raw("services")  as string[];
  const times     = t.raw("times")     as string[];
  
  const infoItems = [
    `${STATS.years.value}${STATS.years.suffix} ${t("infoYears")}`,
    `${STATS.clients.value}${STATS.clients.suffix} ${t("infoClients")}`,
    `${STATS.satisfaction.suffix}${STATS.satisfaction.value} ${t("infoSatisfaction")}`,
    t("infoProtocols")
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      onClick={closeModal}
      style={{
        position:  "fixed",
        top:       0,
        left:      0,
        right:     0,
        bottom:    0,
        // dvh: mobil tarayıcı adres çubuğunu hesaba katar
        height:    "100dvh",
        zIndex:    9999,  // navbar (z:50) ve her şeyin üstünde
        display:   "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:   "1rem",
        backgroundColor: visible ? "rgba(20,18,14,0.75)" : "rgba(20,18,14,0)",
        backdropFilter:  visible ? "blur(7px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(7px)" : "blur(0px)",
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
      className="modal-backdrop-inner"
    >
      {/* ── Panel ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:     "100%",
          maxWidth:  "900px",
          // 92dvh: mobil adres çubuğu dahil gerçek viewport yüksekliği
          maxHeight: "92dvh",
          // Önemli: overflow:hidden grid'i kırıyor, sadece Y ekseninde scroll
          overflowX: "hidden",
          overflowY: "auto",
          // iOS smooth scroll
          WebkitOverflowScrolling: "touch" as never,
          overscrollBehavior: "contain",
          display:   "grid",
          gridTemplateColumns: "1fr 300px",
          borderRadius: "1.5rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.18)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.96)",
          opacity:   visible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(.22,.68,0,1.2), opacity 0.3s ease",
        }}
        className="modal-grid"
      >

        {/* ─── LEFT: Form ─── */}
        <div style={{ background: "var(--color-cream)", padding: "2.25rem 2rem", overflowY: "auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)" }}>
                  Luxe Beauty
                </p>
                <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem,2.5vw,1.9rem)", fontWeight: 400, color: "var(--color-charcoal)", lineHeight: 1.2 }}>
                  {t("title")}
                </h2>
                <p style={{ margin: "0.45rem 0 0", fontSize: "0.875rem", color: "var(--color-charcoal-muted)", lineHeight: 1.65 }}>
                  {t("subtitle")}
                </p>
              </div>
              <button
                id="modal-close-btn"
                onClick={closeModal}
                aria-label={t("close")}
                style={closeBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={15} style={{ color: "var(--color-charcoal)" }} />
              </button>
            </div>
            <div style={{ width: "2.75rem", height: "2px", background: "linear-gradient(90deg,var(--color-gold),var(--color-gold-light))", borderRadius: "999px", marginTop: "1rem" }} />
          </div>

          {/* ── SUCCESS ── */}
          {status === "success" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "2.5rem 1rem", gap: "1.1rem" }}>
              <div style={{ width: "68px", height: "68px", borderRadius: "9999px", background: "linear-gradient(135deg,var(--color-gold),var(--color-gold-light))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(212,175,55,0.35)" }}>
                <Check size={30} style={{ color: "#fff" }} strokeWidth={2.5} />
              </div>
              <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 400, color: "var(--color-charcoal)" }}>
                {t("successTitle")}
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-charcoal-muted)", maxWidth: "340px" }}>
                {t("successText")}
              </p>
              <button onClick={closeModal} className="btn-gold" style={{ marginTop: "0.5rem", fontSize: "0.875rem", padding: "0.7rem 2rem" }}>
                {t("successClose")}
              </button>
            </div>

          ) : (
            /* ── FORM ── */
            <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Name + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }} className="form-row">
                <Field label={t("labelName")} required>
                  <input id="modal-name" name="name" type="text" required placeholder={t("placeholderName")} style={{ ...inputStyle, borderColor: formErrors.name ? "#ef4444" : "rgba(212,175,55,0.28)" }} onChange={() => setFormErrors(prev => ({ ...prev, name: undefined }))} />
                  {formErrors.name && <span style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.2rem" }}>{formErrors.name}</span>}
                </Field>
                <Field label={t("labelPhone")} required>
                  <input id="modal-phone" name="phone" type="tel" required placeholder={t("placeholderPhone")} style={{ ...inputStyle, borderColor: formErrors.phone ? "#ef4444" : "rgba(212,175,55,0.28)" }} onChange={() => setFormErrors(prev => ({ ...prev, phone: undefined }))} />
                  {formErrors.phone && <span style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.2rem" }}>{formErrors.phone}</span>}
                </Field>
              </div>

              {/* Email */}
              <Field label={t("labelEmail")} required>
                <input id="modal-email" name="email" type="email" required placeholder={t("placeholderEmail")} style={inputStyle} />
              </Field>

              {/* Service */}
              <Field label={t("labelService")} required>
                <div style={{ position: "relative" }}>
                  <select id="modal-service" name="service" required defaultValue="" style={{ ...inputStyle, appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}>
                    <option value="" disabled>—</option>
                    {services.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-gold)", pointerEvents: "none" }} />
                </div>
              </Field>

              {/* Date + Time */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Field label={t("labelDate")} required>
                  <input id="modal-date" name="date" type="date" required style={{ ...inputStyle, colorScheme: "light" }} min={new Date().toISOString().split("T")[0]} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }} />
                </Field>
                <Field label={t("labelTime")} required>
                  {!selectedDate ? (
                    <div style={{ padding: "0.875rem", fontSize: "0.85rem", color: "var(--color-charcoal-muted)", border: "1.5px dashed rgba(212,175,55,0.3)", borderRadius: "0.6rem", textAlign: "center", background: "#fdfdfa" }}>
                      {locale === "tr" ? "Lütfen önce bir tarih seçiniz" : "Please select a date first"}
                    </div>
                  ) : isFetchingTimes ? (
                    <div style={{ padding: "0.875rem", fontSize: "0.85rem", color: "var(--color-gold)", border: "1.5px dashed rgba(212,175,55,0.3)", borderRadius: "0.6rem", textAlign: "center", background: "#fdfdfa", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      {locale === "tr" ? "Müsait saatler kontrol ediliyor..." : "Checking available times..."}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {times.map((h) => {
                        const booked = bookedTimes.includes(h);
                        const isSelected = selectedTime === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={booked}
                            onClick={() => setSelectedTime(h)}
                            style={{
                              padding: "0.6rem 0",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              borderRadius: "0.4rem",
                              border: "1.5px solid",
                              cursor: booked ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                              borderColor: booked ? "#fca5a5" : isSelected ? "var(--color-gold)" : "#86efac",
                              background: booked ? "#fee2e2" : isSelected ? "var(--color-gold)" : "#dcfce3",
                              color: booked ? "#ef4444" : isSelected ? "#fff" : "#166534",
                              opacity: booked ? 0.7 : 1,
                              transform: isSelected ? "scale(1.02)" : "scale(1)"
                            }}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <input type="hidden" name="time" value={selectedTime} required />
                </Field>
              </div>

              {/* Note */}
              <Field label={t("labelNote")}>
                <textarea id="modal-note" name="note" placeholder={t("placeholderNote")} rows={2} style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
              </Field>

              {/* Error banner */}
              {status === "error" && (
                <p style={{ margin: 0, padding: "0.7rem 1rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "0.5rem", fontSize: "0.85rem", color: "#b91c1c" }}>
                  ⚠ {errorMsg || "Bir hata oluştu, lütfen tekrar deneyin."}
                </p>
              )}

              {/* Submit */}
              <button
                id="modal-submit-btn"
                type="submit"
                disabled={status === "loading"}
                className="btn-gold"
                style={{ marginTop: "0.25rem", fontSize: "0.9rem", padding: "0.875rem", justifyContent: "center", opacity: status === "loading" ? 0.75 : 1, cursor: status === "loading" ? "not-allowed" : "pointer" }}
              >
                {status === "loading" ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {locale === "tr" ? "Gönderiliyor…" : "Sending…"}</>
                ) : t("submit")}
              </button>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          )}
        </div>

        {/* ─── RIGHT: Info Panel ─── */}
        <div style={{ background: "var(--color-charcoal)", padding: "2.25rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.75rem" }} className="modal-info-panel">
          <div style={{ width: "2.25rem", height: "3px", background: "linear-gradient(90deg,var(--color-gold),var(--color-gold-light))", borderRadius: "999px" }} />

          <div>
            <p style={{ margin: "0 0 0.875rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)" }}>
              {t("infoTitle")}
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {infoItems.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <Star size={11} fill="var(--color-gold)" style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InfoRow Icon={Clock} label={t("infoHours")} value={t("infoHoursVal")} />
            <InfoRow Icon={Phone} label="Telefon" value={t("infoPhone")} />
          </div>

          <div style={{ marginTop: "auto", position: "relative", padding: "1rem 0" }}>
            <div style={{ position: "absolute", width: "100px", height: "100px", borderRadius: "9999px", background: "rgba(212,175,55,0.06)", bottom: "-20px", right: "-20px" }} />
            <p style={{ position: "relative", fontFamily: "var(--font-serif)", fontSize: "1rem", fontStyle: "italic", color: "rgba(255,255,255,0.2)", margin: 0, lineHeight: 1.6 }}>
              &ldquo;Elegance is the only beauty that never fades.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Tablet ve altı: info paneli gizle, tek kolon ── */
        @media (max-width: 700px) {
          .modal-grid       { grid-template-columns: 1fr !important; }
          .modal-info-panel { display: none !important; }
          .form-row         { grid-template-columns: 1fr !important; }
        }

        /* ── Telefon: modal tam genişlik, alt sayfa gibi görünür ── */
        @media (max-width: 480px) {
          .modal-backdrop-inner {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .modal-grid {
            border-bottom-left-radius:  0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius:  1.25rem !important;
            border-top-right-radius: 1.25rem !important;
            max-height: 94dvh !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--color-charcoal-light)" }}>
        {label}{required && <span style={{ color: "var(--color-gold)", marginLeft: "0.2rem" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ Icon, label, value }: { Icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
      <Icon size={14} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "3px" }} />
      <div>
        <p style={{ margin: "0 0 0.18rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", whiteSpace: "pre-line", lineHeight: 1.6 }}>{value}</p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.875rem", fontSize: "0.9rem",
  fontFamily: "var(--font-sans)", color: "var(--color-charcoal)", background: "#fff",
  border: "1.5px solid rgba(212,175,55,0.28)", borderRadius: "0.6rem",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid rgba(212,175,55,0.3)",
  borderRadius: "9999px", width: "34px", height: "34px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0, marginLeft: "1rem", transition: "background 0.2s",
};

