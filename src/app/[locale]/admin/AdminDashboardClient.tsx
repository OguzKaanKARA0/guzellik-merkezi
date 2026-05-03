"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus, deleteBooking, deleteLead, createManualBooking, createManualLead } from "./actions";
import { Check, X, Clock, Loader2, User, Phone, Briefcase, Trash2, Plus, ArrowRight, Calendar, Mail, FileText } from "lucide-react";

type Booking = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  note: string;
  status: "pending" | "approved" | "cancelled";
};

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  service: string;
  source: string;
  status: string;
};

export function AdminDashboardClient({ 
  initialBookings, 
  initialLeads 
}: { 
  initialBookings: Booking[], 
  initialLeads: Lead[] 
}) {
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState<"booking" | "lead" | null>(null);

  const handleStatusUpdate = (id: string, newStatus: "approved" | "cancelled") => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await updateBookingStatus(id, newStatus);
      if (!res.success) {
        alert("Güncelleme başarısız: " + res.error);
      }
      setLoadingId(null);
    });
  };

  const handleDelete = async (id: string, type: "booking" | "lead") => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    
    setLoadingId(id);
    startTransition(async () => {
      const res = type === "booking" ? await deleteBooking(id) : await deleteLead(id);
      if (!res.success) {
        alert("Silme işlemi başarısız: " + res.error);
      }
      setLoadingId(null);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span style={{ padding: "0.4rem 0.8rem", background: "#dcfce3", color: "#166534", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><Check size={12}/> Onaylandı</span>;
      case "cancelled":
        return <span style={{ padding: "0.4rem 0.8rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><X size={12}/> İptal Edildi</span>;
      default:
        return <span style={{ padding: "0.4rem 0.8rem", background: "#fef9c3", color: "#854d0e", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><Clock size={12}/> Bekliyor</span>;
    }
  };

  const TabButton = ({ id, label, count }: { id: "bookings" | "leads", label: string, count: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "1rem 2rem",
        background: activeTab === id ? "#fff" : "transparent",
        border: "none",
        borderBottom: activeTab === id ? "2px solid var(--color-gold)" : "2px solid transparent",
        color: activeTab === id ? "var(--color-primary)" : "var(--color-charcoal-muted)",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}
    >
      {label}
      <span style={{ 
        backgroundColor: activeTab === id ? "var(--color-gold)" : "rgba(0,0,0,0.05)", 
        color: activeTab === id ? "#fff" : "var(--color-charcoal-muted)",
        padding: "0.1rem 0.5rem",
        borderRadius: "99px",
        fontSize: "0.7rem"
      }}>
        {count}
      </span>
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header with Tabs & Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <TabButton id="bookings" label="Randevular" count={initialBookings.length} />
          <TabButton id="leads" label="Teklif Talepleri" count={initialLeads.length} />
        </div>
        
        <button 
          onClick={() => setShowAddModal(activeTab === "bookings" ? "booking" : "lead")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-charcoal)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-primary)"}
        >
          <Plus size={16} /> Manuel Ekle
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1px solid rgba(212,175,55,0.2)", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
        <div style={{ overflowX: "auto" }}>
          {activeTab === "bookings" ? (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(212,175,55,0.05)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
                  <th style={thStyle}>Tarih / Saat</th>
                  <th style={thStyle}>Müşteri</th>
                  <th style={thStyle}>Hizmet</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {initialBookings.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "4rem", textAlign: "center", color: "var(--color-charcoal-muted)" }}>Henüz hiç randevu bulunmuyor.</td></tr>
                ) : (
                  initialBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{b.date}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-charcoal-muted)", marginTop: "0.2rem" }}>{b.time}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{b.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-charcoal-muted)", marginTop: "0.2rem" }}>{b.phone}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: "var(--color-charcoal)" }}>{b.service}</div>
                        {b.note && <div style={{ fontSize: "0.8rem", color: "var(--color-charcoal-muted)", marginTop: "0.3rem", fontStyle: "italic" }}>Not: {b.note}</div>}
                      </td>
                      <td style={tdStyle}>
                        {getStatusBadge(b.status)}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          {loadingId === b.id ? (
                            <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--color-gold)" }} />
                          ) : (
                            <>
                              <button 
                                disabled={isPending || b.status === "approved"}
                                onClick={() => handleStatusUpdate(b.id, "approved")}
                                title="Onayla"
                                style={actionBtnStyle("#dcfce3", "#166534", "#86efac", b.status === "approved")}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                disabled={isPending || b.status === "cancelled"}
                                onClick={() => handleStatusUpdate(b.id, "cancelled")}
                                title="İptal Et"
                                style={actionBtnStyle("#fee2e2", "#b91c1c", "#fca5a5", b.status === "cancelled")}
                              >
                                <X size={16} />
                              </button>
                              <div style={{ width: "1px", height: "20px", background: "rgba(0,0,0,0.1)", margin: "0 0.25rem" }} />
                              <button 
                                disabled={isPending}
                                onClick={() => handleDelete(b.id, "booking")}
                                title="Sil"
                                style={{ ...actionBtnStyle("transparent", "#ef4444", "rgba(239, 68, 68, 0.2)", false), border: "1px solid rgba(239, 68, 68, 0.2)" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(212,175,55,0.05)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
                  <th style={thStyle}>Kayıt Tarihi</th>
                  <th style={thStyle}>Müşteri</th>
                  <th style={thStyle}>Hizmet</th>
                  <th style={thStyle}>Kaynak</th>
                  <th style={thStyle}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {initialLeads.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-charcoal-muted)" }}>Henüz hiç teklif talebi bulunmuyor.</td></tr>
                ) : (
                  initialLeads.map((l) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={tdStyle}>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-charcoal-muted)" }}>
                          {new Date(l.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <User size={14} style={{ color: "var(--color-gold)" }} /> {l.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-charcoal-muted)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Phone size={14} style={{ color: "var(--color-gold)" }} /> {l.phone}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: "var(--color-charcoal)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Briefcase size={14} style={{ color: "var(--color-gold)" }} /> {l.service || "Genel"}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-charcoal-muted)", background: "rgba(0,0,0,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px", display: "inline-block" }}>
                          {l.source}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {loadingId === l.id ? (
                           <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--color-gold)" }} />
                        ) : (
                          <button 
                            disabled={isPending}
                            onClick={() => handleDelete(l.id, "lead")}
                            title="Sil"
                            style={{ ...actionBtnStyle("transparent", "#ef4444", "rgba(239, 68, 68, 0.2)", false), border: "1px solid rgba(239, 68, 68, 0.2)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Add Modals */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setShowAddModal(null)}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-primary)" }}>
                {showAddModal === "booking" ? "Yeni Manuel Randevu" : "Yeni Manuel Talep"}
              </h3>
              <button onClick={() => setShowAddModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-charcoal-muted)" }}><X size={20}/></button>
            </div>
            
            <form 
              style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setLoadingId("manual");
                startTransition(async () => {
                  if (showAddModal === "booking") {
                    await createManualBooking({
                      name: fd.get("name") as string,
                      phone: fd.get("phone") as string,
                      email: fd.get("email") as string,
                      service: fd.get("service") as string,
                      date: fd.get("date") as string,
                      time: fd.get("time") as string,
                      note: fd.get("note") as string,
                    });
                  } else {
                    await createManualLead({
                      name: fd.get("name") as string,
                      phone: fd.get("phone") as string,
                      service: fd.get("service") as string,
                      source: "Admin_Manuel"
                    });
                  }
                  setLoadingId(null);
                  setShowAddModal(null);
                });
              }}
            >
              <div style={fieldStyle}><label style={labelStyle}>Müşteri Adı</label><input name="name" required style={inputStyle} placeholder="Ad Soyad" /></div>
              <div style={fieldStyle}><label style={labelStyle}>Telefon</label><input name="phone" required style={inputStyle} placeholder="05XX XXX XX XX" /></div>
              
              {showAddModal === "booking" && (
                <>
                  <div style={fieldStyle}><label style={labelStyle}>E-posta</label><input name="email" type="email" style={inputStyle} placeholder="ornek@mail.com" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={fieldStyle}><label style={labelStyle}>Tarih</label><input name="date" type="date" required style={inputStyle} /></div>
                    <div style={fieldStyle}><label style={labelStyle}>Saat</label><input name="time" required style={inputStyle} placeholder="09:00" /></div>
                  </div>
                </>
              )}

              <div style={fieldStyle}>
                <label style={labelStyle}>Hizmet</label>
                <select name="service" required style={inputStyle}>
                  <option value="Saç Tasarımı">Saç Tasarımı</option>
                  <option value="Premium Cilt Bakımı">Premium Cilt Bakımı</option>
                  <option value="Kişiye Özel Makyaj">Kişiye Özel Makyaj</option>
                  <option value="Manikür & Pedikür">Manikür & Pedikür</option>
                  <option value="Kaş Tasarımı">Kaş Tasarımı</option>
                  <option value="Kalıcı Makyaj">Kalıcı Makyaj</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              {showAddModal === "booking" && (
                <div style={fieldStyle}><label style={labelStyle}>Not (Opsiyonel)</label><textarea name="note" style={{ ...inputStyle, resize: "none" }} rows={2} /></div>
              )}

              <button 
                type="submit" 
                disabled={isPending}
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "var(--color-gold)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                {isPending ? <Loader2 size={18} className="spin" /> : "Kaydet ve Kapat"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const thStyle = { padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-charcoal-light)", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const tdStyle = { padding: "1.25rem 1.5rem", verticalAlign: "top" as const };

const actionBtnStyle = (bg: string, color: string, border: string, isActive: boolean) => ({
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: `1px solid ${border}`,
  background: isActive ? bg : "#fff",
  color: color,
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  cursor: isActive ? "default" : "pointer",
  opacity: isActive ? 0.5 : 1,
  transition: "all 0.2s"
});

const fieldStyle = { display: "flex", flexDirection: "column", gap: "0.35rem" };
const labelStyle = { fontSize: "0.75rem", fontWeight: 700, color: "var(--color-charcoal-muted)", textTransform: "uppercase" as const };
const inputStyle = { 
  width: "100%", 
  padding: "0.75rem", 
  borderRadius: "0.5rem", 
  border: "1px solid rgba(0,0,0,0.1)", 
  fontSize: "0.9rem", 
  outline: "none" 
};
