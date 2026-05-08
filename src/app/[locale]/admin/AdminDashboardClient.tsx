"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { updateBookingStatus, deleteBooking, deleteLead, createManualBooking, createManualLead } from "@/app/[locale]/admin/actions";
import { createClient } from "@/utils/supabase/client";
import { Check, X, Clock, Loader2, Trash2, Plus, Bell } from "lucide-react";

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

type Toast = {
  id: string;
  type: "booking" | "lead";
  message: string;
};

export function AdminDashboardClient({
  initialBookings,
  initialLeads,
}: {
  initialBookings: Booking[];
  initialLeads: Lead[];
}) {
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<"booking" | "lead" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "booking" | "lead" } | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "ok" | "error">("connecting");

  const supabaseRef = useRef(createClient());

  const addToast = useCallback((type: "booking" | "lead", message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const bookingsChannel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        const row = payload.new as Booking;
        setBookings((prev) => [row, ...prev]);
        addToast("booking", `Yeni randevu: ${row.name} — ${row.service} (${row.date})`);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, (payload) => {
        const row = payload.new as Booking;
        setBookings((prev) => prev.map((b) => (b.id === row.id ? row : b)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "bookings" }, (payload) => {
        const old = payload.old as { id: string };
        setBookings((prev) => prev.filter((b) => b.id !== old.id));
        setDeletingIds((prev) => { const s = new Set(prev); s.delete(old.id); return s; });
      })
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "ok" : status === "CHANNEL_ERROR" ? "error" : "connecting");
      });

    const leadsChannel = supabase
      .channel("admin-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        const row = payload.new as Lead;
        setLeads((prev) => [row, ...prev]);
        addToast("lead", `Yeni teklif talebi: ${row.name} — ${row.service || "Genel"}`);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "leads" }, (payload) => {
        const old = payload.old as { id: string };
        setLeads((prev) => prev.filter((l) => l.id !== old.id));
        setDeletingIds((prev) => { const s = new Set(prev); s.delete(old.id); return s; });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(leadsChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = (id: string, newStatus: "approved" | "cancelled") => {
    console.log("[DEBUG] Durum Güncelleme Tetiklendi:", id, newStatus);
    setLoadingId(id);
    startTransition(async () => {
      try {
        const res = await updateBookingStatus(id, newStatus);
        if (!res.success) {
          const errorMsg = typeof res.error === "string" ? res.error : JSON.stringify(res.error);
          alert(`Hata: ${errorMsg}`);
        } else {
          setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
        }
      } catch (err: unknown) {
        alert("Baglanti hatasi: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoadingId(null);
      }
    });
  };

  const handleDeleteTrigger = (id: string, type: "booking" | "lead") => {
    setDeleteConfirm({ id, type });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    console.log("[DEBUG] Thanos Snap Basladi:", id);
    setDeleteConfirm(null);
    setDeletingIds((prev) => new Set(prev).add(id));
    await new Promise((resolve) => setTimeout(resolve, 800));
    startTransition(async () => {
      try {
        const res = type === "booking" ? await deleteBooking(id) : await deleteLead(id);
        if (!res.success) {
          alert(`Silme basarisiz: ${res.error}`);
          setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        } else {
          if (type === "booking") setBookings((prev) => prev.filter((b) => b.id !== id));
          else setLeads((prev) => prev.filter((l) => l.id !== id));
          setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        }
      } catch (err: unknown) {
        alert("Silme sirasinda hata: " + (err instanceof Error ? err.message : String(err)));
        setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span style={{ padding: "0.4rem 0.8rem", background: "#dcfce3", color: "#166534", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><Check size={12} /> Onaylandi</span>;
      case "cancelled":
        return <span style={{ padding: "0.4rem 0.8rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><X size={12} /> Iptal Edildi</span>;
      default:
        return <span style={{ padding: "0.4rem 0.8rem", background: "#fef9c3", color: "#854d0e", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><Clock size={12} /> Bekliyor</span>;
    }
  };

  return (
    <div className="admin-dashboard">

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Bell size={15} />
            <span>{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}><X size={13} /></button>
          </div>
        ))}
      </div>

      <div className="admin-header">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
            Randevular <span className="tab-count">{bookings.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === "leads" ? "active" : ""}`} onClick={() => setActiveTab("leads")}>
            Teklif Talepleri <span className="tab-count">{leads.length}</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className={`realtime-dot realtime-${realtimeStatus}`} title={realtimeStatus === "ok" ? "Canli baglanti aktif" : realtimeStatus === "error" ? "Baglanti hatasi" : "Baglaniliyor..."} />
          <button className="add-btn" onClick={() => setShowAddModal(activeTab === "bookings" ? "booking" : "lead")}>
            <Plus size={16} /> Manuel Ekle
          </button>
        </div>
      </div>

      <div className="table-container">
        {activeTab === "bookings" ? (
          <table className="admin-table">
            <thead><tr><th>Tarih / Saat</th><th>Musteri</th><th>Hizmet</th><th>Durum</th><th>Islem</th></tr></thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Henuz randevu yok.</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className={deletingIds.has(b.id) ? "thanos-snap" : ""}>
                  <td><strong>{b.date}</strong><br /><small>{b.time}</small></td>
                  <td><strong>{b.name}</strong><br /><small>{b.phone}</small></td>
                  <td>{b.service}</td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td>
                    <div className="action-group">
                      {loadingId === b.id ? <Loader2 className="spin" size={20} /> : (
                        <>
                          <button className="btn-approve" onClick={() => handleStatusUpdate(b.id, "approved")} disabled={b.status === "approved"} title="Onayla"><Check size={16} /></button>
                          <button className="btn-cancel" onClick={() => handleStatusUpdate(b.id, "cancelled")} disabled={b.status === "cancelled"} title="Iptal Et"><X size={16} /></button>
                          <button className="btn-delete" onClick={() => handleDeleteTrigger(b.id, "booking")} title="Sil"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Kayit Tarihi</th><th>Musteri</th><th>Hizmet</th><th>Kaynak</th><th>Islem</th></tr></thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Henuz teklif talebi yok.</td></tr>
              ) : leads.map((l) => (
                <tr key={l.id} className={deletingIds.has(l.id) ? "thanos-snap" : ""}>
                  <td><small>{new Date(l.created_at).toLocaleString("tr-TR")}</small></td>
                  <td><strong>{l.name}</strong><br /><small>{l.phone}</small></td>
                  <td>{l.service || "Genel"}</td>
                  <td><span className="source-tag">{l.source}</span></td>
                  <td>
                    <div className="action-group">
                      {deletingIds.has(l.id)
                        ? <Loader2 className="spin" size={20} />
                        : <button className="btn-delete" onClick={() => handleDeleteTrigger(l.id, "lead")} title="Sil"><Trash2 size={16} /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.85)", backdropFilter: "blur(12px)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: "420px", borderRadius: "2rem", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.3)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ padding: "3rem 2rem 2rem", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, background: "rgba(239,68,68,0.05)", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid rgba(239,68,68,0.1)" }}>
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-primary)", fontWeight: 400 }}>Islemi Onayla</h3>
              <p style={{ margin: 0, color: "#8B7D77", fontSize: "0.95rem", lineHeight: 1.6, padding: "0 1rem" }}>
                Bu kaydi kalici olarak silmek istediginize emin misiniz? Bu islem geri alinamaz.
              </p>
            </div>
            <div style={{ padding: "1.5rem 2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "1rem", background: "#f8f8f8", border: "1px solid #eee", borderRadius: "1rem", cursor: "pointer", fontWeight: 600 }}>Vazgec</button>
              <button onClick={confirmDelete} disabled={isPending} style={{ padding: "1rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "1rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {isPending ? <Loader2 size={18} className="spin" /> : "Kaydi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div onClick={() => setShowAddModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: "450px", borderRadius: "20px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-primary)", fontWeight: 400 }}>
              {showAddModal === "booking" ? "Yeni Manuel Randevu" : "Yeni Manuel Talep"}
            </h3>
            <form className="admin-form" onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setLoadingId("manual");
              startTransition(async () => {
                if (showAddModal === "booking") {
                  await createManualBooking({ name: fd.get("name") as string, phone: fd.get("phone") as string, service: fd.get("service") as string, date: fd.get("date") as string, time: fd.get("time") as string });
                } else {
                  await createManualLead({ name: fd.get("name") as string, phone: fd.get("phone") as string, service: fd.get("service") as string, source: "Admin_Manuel" });
                }
                setLoadingId(null);
                setShowAddModal(null);
              });
            }}>
              <input name="name" placeholder="Isim" required />
              <input name="phone" placeholder="Telefon" required />
              <input name="service" placeholder="Hizmet" required />
              {showAddModal === "booking" && (<><input name="date" type="date" required /><input name="time" placeholder="Saat (Orn: 14:30)" required /></>)}
              <button type="submit" disabled={isPending} className="btn-submit">{isPending ? <Loader2 size={18} className="spin" /> : "Kaydet"}</button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard { padding: 2rem; color: var(--color-primary); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .tabs { display: flex; gap: 0.5rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #888; font-weight: 600; transition: all 0.2s; }
        .tab-btn.active { border-bottom-color: var(--color-gold); color: var(--color-primary); }
        .tab-count { background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; }
        .tab-btn.active .tab-count { background: var(--color-gold); color: #fff; }
        .realtime-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .realtime-ok         { background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse-green 2s infinite; }
        .realtime-error      { background: #ef4444; }
        .realtime-connecting { background: #f59e0b; animation: pulse-amber 1s infinite; }
        @keyframes pulse-green { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes pulse-amber { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        .add-btn { background: var(--color-primary); color: #fff; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
        .add-btn:hover { background: var(--color-gold); }
        .table-container { background: #fff; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid rgba(212,175,55,0.1); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 1.2rem; background: #fafafa; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; }
        .admin-table td { padding: 1.2rem; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
        .action-group { display: flex; gap: 0.75rem; align-items: center; }
        .action-group button { width: 36px; height: 36px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); color: #555; padding: 0; }
        .btn-approve:hover:not(:disabled) { background: #dcfce3; color: #166534; border-color: #86efac; transform: translateY(-2px); }
        .btn-cancel:hover:not(:disabled)  { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; transform: translateY(-2px); }
        .btn-delete:hover  { background: #1a1a1a; color: #fff; border-color: #1a1a1a; transform: translateY(-2px); }
        button:disabled { opacity: 0.35; cursor: not-allowed; }
        .admin-form { display: flex; flex-direction: column; gap: 0.85rem; }
        .admin-form input { padding: 0.8rem 1rem; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .admin-form input:focus { border-color: var(--color-gold); }
        .btn-submit { background: var(--color-gold); color: #fff; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: opacity 0.2s; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .source-tag { font-size: 0.7rem; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; color: #777; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .thanos-snap { animation: thanos-dust 0.8s ease-in forwards; pointer-events: none; }
        @keyframes thanos-dust {
          0%   { opacity:1; transform:scale(1); filter:blur(0) grayscale(0); }
          30%  { transform:scale(1.02) translateY(-2px); filter:blur(1px) grayscale(0.5); }
          100% { opacity:0; transform:scale(1.05) translateY(-10px); filter:blur(15px) grayscale(1) sepia(1); }
        }
        .toast-container { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 20000; display: flex; flex-direction: column; gap: 0.75rem; pointer-events: none; }
        .toast { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1.1rem; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); font-size: 0.875rem; font-weight: 600; max-width: 360px; pointer-events: all; animation: toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .toast-booking { background: #1a1a1a; color: #fff; border-left: 4px solid var(--color-gold, #C9A96E); }
        .toast-lead    { background: #fff; color: var(--color-primary, #2C1810); border: 1px solid rgba(201,169,110,0.3); border-left: 4px solid var(--color-gold, #C9A96E); }
        .toast span { flex: 1; }
        .toast button { background: none; border: none; cursor: pointer; opacity: 0.5; display: flex; color: inherit; padding: 0; }
        .toast button:hover { opacity: 1; }
        @keyframes toast-in {
          from { opacity:0; transform: translateX(40px) scale(0.95); }
          to   { opacity:1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}