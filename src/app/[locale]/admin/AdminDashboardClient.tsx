"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { updateBookingStatus, deleteBooking, deleteLead, createManualBooking, createManualLead } from "@/app/[locale]/admin/actions";
import { createClient } from "@/utils/supabase/client";
import {
  Check, X, Clock, Loader2, Trash2, Plus, Bell,
  Calendar, TrendingUp, Users, CalendarClock,
  CheckCheck, CircleCheck, UserX, Minus, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle,
  PieChart, Pie, Cell, Legend, Sector
} from "recharts";
import { useFeature } from "@/hooks/useFeature";
import * as XLSX from "xlsx";

/* ── Tipler ── */
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
  status: "pending" | "approved" | "confirmed" | "cancelled" | "completed" | "no_show" | string;
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

/* ── Ana bileşen ── */
export function AdminDashboardClient({
  initialBookings,
  initialLeads,
}: {
  initialBookings: Booking[];
  initialLeads: Lead[];
}) {
  const { value: canAdmin, loading: featureLoading } = useFeature("admin_panel");

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

  const exportBookingsXlsx = () => {
    const statusLabel: Record<string, string> = {
      pending: "Bekliyor", confirmed: "Onaylandı", approved: "Onaylandı",
      completed: "Tamamlandı", cancelled: "İptal", no_show: "Gelmedi",
    };
    const headers = ["Tarih", "Saat", "Müşteri Adı", "Telefon", "Hizmet", "Durum"];
    const rows = bookings.map((b) => [b.date, b.time, b.name, b.phone, b.service, statusLabel[b.status] ?? b.status]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
    for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[cellAddr]) continue;
      ws[cellAddr].s = { font: { bold: true } };
    }
    ws["!cols"] = headers.map((h, i) => ({
      wch: Math.min(Math.max(h.length, ...rows.map((r) => (r[i] ?? "").toString().length)) + 2, 40),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Randevular");
    XLSX.writeFile(wb, `randevular-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    const base: React.CSSProperties = {
      padding: "0.35rem 0.75rem", borderRadius: "99px", fontSize: "0.72rem",
      fontWeight: 700, display: "inline-flex", alignItems: "center",
      gap: "0.35rem", letterSpacing: "0.02em", whiteSpace: "nowrap",
    };
    switch (status) {
      case "pending":
        return <span style={{ ...base, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}><Clock size={11} /> Bekliyor</span>;
      case "confirmed":
      case "approved":
        return <span style={{ ...base, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}><CheckCheck size={11} /> Onaylandı</span>;
      case "completed":
        return <span style={{ ...base, background: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff" }}><CircleCheck size={11} /> Tamamlandı</span>;
      case "cancelled":
        return <span style={{ ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}><X size={11} /> İptal</span>;
      case "no_show":
        return <span style={{ ...base, background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" }}><UserX size={11} /> Gelmedi</span>;
      default:
        return <span style={{ ...base, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}><Minus size={11} /> Bilinmiyor</span>;
    }
  };

  if (featureLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "9999px", border: "3px solid var(--color-gold)", borderTopColor: "transparent", animation: "admin-spin 0.75s linear infinite" }} />
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!canAdmin) {
    return (
      <div>
        <p>Bu özellik Basic pakette bulunmuyor.</p>
        <p>Pro pakete geçmek için iletişime geçin.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* ── Toast bildirimleri ── */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Bell size={15} />
            <span>{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}><X size={13} /></button>
          </div>
        ))}
      </div>

      {/* ── KPI Kartları ── */}
      <KpiGrid bookings={bookings} loading={featureLoading} />

      {/* ── Grafikler ── */}
      <ChartsRow bookings={bookings} />

      {/* ── Tab başlıkları + butonlar ── */}
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
          {activeTab === "bookings" && (
            <button className="export-btn" onClick={exportBookingsXlsx} title="Excel olarak indir">
              <Download size={15} /> Dışa Aktar
            </button>
          )}
          <button className="add-btn" onClick={() => setShowAddModal(activeTab === "bookings" ? "booking" : "lead")}>
            <Plus size={16} /> Manuel Ekle
          </button>
        </div>
      </div>

      {/* ── Tablolar ── */}
      <div className="table-container">
        {activeTab === "bookings" ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih / Saat</th>
                <th>Müşteri</th>
                <th>Hizmet</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Henüz randevu yok.</td></tr>
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
                          <button className="btn-cancel" onClick={() => handleStatusUpdate(b.id, "cancelled")} disabled={b.status === "cancelled"} title="İptal Et"><X size={16} /></button>
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
            <thead>
              <tr>
                <th>Kayıt Tarihi</th>
                <th>Müşteri</th>
                <th>Hizmet</th>
                <th>Kaynak</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Henüz teklif talebi yok.</td></tr>
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

      {/* ── Silme onay modalı ── */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.85)", backdropFilter: "blur(12px)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: "420px", borderRadius: "2rem", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.3)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ padding: "3rem 2rem 2rem", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, background: "rgba(239,68,68,0.05)", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid rgba(239,68,68,0.1)" }}>
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-primary)", fontWeight: 400 }}>İşlemi Onayla</h3>
              <p style={{ margin: 0, color: "#8B7D77", fontSize: "0.95rem", lineHeight: 1.6, padding: "0 1rem" }}>
                Bu kaydı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div style={{ padding: "1.5rem 2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "1rem", background: "#f8f8f8", border: "1px solid #eee", borderRadius: "1rem", cursor: "pointer", fontWeight: 600 }}>Vazgeç</button>
              <button onClick={confirmDelete} disabled={isPending} style={{ padding: "1rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "1rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {isPending ? <Loader2 size={18} className="spin" /> : "Kaydı Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manuel ekle modalı ── */}
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
              <input name="name" placeholder="İsim" required />
              <input name="phone" placeholder="Telefon" required />
              <input name="service" placeholder="Hizmet" required />
              {showAddModal === "booking" && (<><input name="date" type="date" required /><input name="time" placeholder="Saat (Örn: 14:30)" required /></>)}
              <button type="submit" disabled={isPending} className="btn-submit">
                {isPending ? <Loader2 size={18} className="spin" /> : "Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard { padding: 2rem; color: var(--color-primary); background-color: #FAF7F2; min-height: 100vh; }

        /* ── Tab + header ── */
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .tabs { display: flex; gap: 0.5rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #888; font-weight: 600; transition: all 0.2s; }
        .tab-btn.active { border-bottom-color: var(--color-gold); color: var(--color-primary); }
        .tab-count { background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; }
        .tab-btn.active .tab-count { background: var(--color-gold); color: #fff; }

        /* ── Realtime dot ── */
        .realtime-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .realtime-ok         { background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse-green 2s infinite; }
        .realtime-error      { background: #ef4444; }
        .realtime-connecting { background: #f59e0b; animation: pulse-amber 1s infinite; }
        @keyframes pulse-green { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes pulse-amber { 0%,100% { opacity:1; } 50% { opacity:.3; } }

        /* ── Butonlar ── */
        .export-btn { background: transparent; color: var(--color-gold, #C9A96E); border: 1.5px solid var(--color-gold, #C9A96E); padding: 0.65rem 1.1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.45rem; font-weight: 600; font-size: 0.875rem; transition: background 0.2s, color 0.2s; }
        .export-btn:hover { background: var(--color-gold, #C9A96E); color: #fff; }
        .add-btn { background: var(--color-primary); color: #fff; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
        .add-btn:hover { background: var(--color-gold); }

        /* ── Tablo ── */
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

        /* ── Form ── */
        .admin-form { display: flex; flex-direction: column; gap: 0.85rem; }
        .admin-form input { padding: 0.8rem 1rem; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .admin-form input:focus { border-color: var(--color-gold); }
        .btn-submit { background: var(--color-gold); color: #fff; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: opacity 0.2s; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Çeşitli ── */
        .source-tag { font-size: 0.7rem; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; color: #777; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .thanos-snap { animation: thanos-dust 0.8s ease-in forwards; pointer-events: none; }
        @keyframes thanos-dust {
          0%   { opacity:1; transform:scale(1); filter:blur(0) grayscale(0); }
          30%  { transform:scale(1.02) translateY(-2px); filter:blur(1px) grayscale(0.5); }
          100% { opacity:0; transform:scale(1.05) translateY(-10px); filter:blur(15px) grayscale(1) sepia(1); }
        }

        /* ── Toast ── */
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

/* ═══════════════════════════════════════════════════
   KPI Grid — saf Tailwind
═══════════════════════════════════════════════════ */
type BookingForKpi = { date: string; status: string; phone: string };

function KpiGrid({ bookings, loading }: { bookings: BookingForKpi[]; loading: boolean }) {
  const now        = new Date();
  const today      = now.toISOString().split("T")[0];

  const yesterday  = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const dayOfWeek  = now.getDay();
  const diffToMon  = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart  = new Date(now);
  weekStart.setDate(now.getDate() + diffToMon);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekStartStr = prevWeekStart.toISOString().split("T")[0];

  const todayCount    = bookings.filter((b) => b.date === today).length;
  const yesterdayCount= bookings.filter((b) => b.date === yesterdayStr).length;
  const weekCount     = bookings.filter((b) => b.date >= weekStartStr).length;
  const prevWeekCount = bookings.filter((b) => b.date >= prevWeekStartStr && b.date < weekStartStr).length;
  const pendingCount  = bookings.filter((b) => b.status === "pending").length;
  const uniquePhones  = new Set(bookings.map((b) => b.phone)).size;

  const todayDelta = todayCount - yesterdayCount;
  const weekDelta  = weekCount  - prevWeekCount;

  const cards = [
    {
      icon: <Calendar size={22} />,
      number: todayCount,
      label: "Bugünkü Randevular",
      sub: todayDelta === 0
        ? "Dünkü ile aynı"
        : `${todayDelta > 0 ? "+" : ""}${todayDelta} dünden`,
      trend: todayDelta > 0 ? "up" : todayDelta < 0 ? "down" : "flat",
    },
    {
      icon: <TrendingUp size={22} />,
      number: weekCount,
      label: "Bu Hafta",
      sub: weekDelta === 0
        ? "Geçen hafta ile aynı"
        : `${weekDelta > 0 ? "+" : ""}${weekDelta} geçen haftadan`,
      trend: weekDelta > 0 ? "up" : weekDelta < 0 ? "down" : "flat",
    },
    {
      icon: <CalendarClock size={22} />,
      number: pendingCount,
      label: "Bekleyen",
      sub: "Onay bekliyor",
      trend: "flat" as const,
    },
    {
      icon: <Users size={22} />,
      number: uniquePhones,
      label: "Toplam Müşteri",
      sub: "Benzersiz numara",
      trend: "flat" as const,
    },
  ];

  const trendColor = (t: string) =>
    t === "up" ? "text-emerald-500" : t === "down" ? "text-red-400" : "text-stone-400";

  const shimmer = (
    <div className="animate-pulse space-y-3">
      <div className="h-3 w-3/4 rounded bg-stone-100" />
      <div className="h-9 w-1/2 rounded bg-stone-100" />
      <div className="h-3 w-2/3 rounded bg-stone-100" />
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-5 mb-8 max-[900px]:grid-cols-2 max-[480px]:gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-200/60 p-6 flex items-start justify-between shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          style={{ borderTop: "4px solid #C9A96E", backgroundColor: "#FAF7F2" }}
        >
          {loading ? shimmer : (
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                {card.label}
              </p>
              <p className="text-4xl font-light mt-2 leading-none" style={{ fontFamily: "var(--font-serif)", color: "#2C1810" }}>
                {card.number.toLocaleString("tr-TR")}
              </p>
              <p className={`text-xs mt-2 font-medium ${trendColor(card.trend)}`}>
                {card.sub}
              </p>
            </div>
          )}
          <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center flex-shrink-0 text-[#C9A96E]">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Charts Row — recharts BarChart + PieChart
═══════════════════════════════════════════════════ */
const PIE_COLORS = ["#C9A96E", "#2C1810", "#B89659", "#4A2B19", "#DBC297"];

type BookingForChart = { date: string; service: string };

/** Özel bar tooltip */
function BarTooltipContent({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #C9A96E", borderRadius: 10, padding: "0.6rem 1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }}>
      <p style={{ margin: 0, color: "#9A8A85", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "4px 0 0", color: "#C9A96E", fontWeight: 700 }}>{payload[0].value} randevu</p>
    </div>
  );
}

/** Özel pie tooltip */
function PieTooltipContent({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #C9A96E", borderRadius: 10, padding: "0.6rem 1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }}>
      <p style={{ margin: 0, color: "#2C1810", fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ margin: "4px 0 0", color: "#C9A96E", fontWeight: 700 }}>{payload[0].value} randevu</p>
    </div>
  );
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ outline: "none" }}
      />
    </g>
  );
};

function ChartsRow({ bookings }: { bookings: BookingForChart[] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Son 7 gün — bar verisi */
  const barData = (() => {
    const days: { label: string; date: string; randevu: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        date:  d.toISOString().split("T")[0],
        randevu: 0,
      });
    }
    bookings.forEach((b) => {
      const entry = days.find((d) => d.date === b.date);
      if (entry) entry.randevu++;
    });
    return days.map(({ label, randevu }) => ({ label, randevu }));
  })();

  /* Hizmet dağılımı — pie verisi */
  const pieData = (() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      const key = b.service || "Diğer";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const cardCls = "bg-white rounded-2xl border border-amber-100 p-6 shadow-sm flex-1 min-w-0";
  const titleCls = "text-sm font-semibold text-stone-700 mb-5";

  return (
    <div className="flex gap-5 mb-8 max-[768px]:flex-col">

      {/* Bar Chart */}
      <div className={cardCls} style={{ borderTop: "4px solid #C9A96E", minHeight: 320 }}>
        <p className={titleCls}>Son 7 Gün</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={barData} barCategoryGap="38%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9A8A85" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#9A8A85" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<BarTooltipContent />} cursor={{ fill: "rgba(201,169,110,0.08)" }} />
            <Bar dataKey="randevu" fill="#C9A96E" radius={[8, 8, 0, 0]} activeBar={<Rectangle fill="#A3834D" />} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className={`${cardCls} overflow-hidden`} style={{ borderTop: "4px solid #C9A96E", minHeight: 350 }}>
        <p className={titleCls}>Hizmet Dağılımı</p>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-52 text-stone-400 text-sm">
            Henüz veri yok.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="42%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
                paddingAngle={3}
                labelLine={false}
                // @ts-expect-error Recharts Pie type mismatch
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                style={{ outline: "none" }}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltipContent />} />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value: string) => (
                  <span style={{ fontSize: "0.85rem", color: "#2C1810", fontWeight: 500, whiteSpace: "normal" }}>{value}</span>
                )}
                wrapperStyle={{ paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
