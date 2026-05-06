"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus, deleteBooking, deleteLead, createManualBooking, createManualLead } from "@/app/[locale]/admin/actions";
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
  const [showAddModal, setShowAddModal] = useState<"booking" | "lead" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: "booking" | "lead" } | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleStatusUpdate = (id: string, newStatus: "approved" | "cancelled") => {
    console.log("[DEBUG] Durum Güncelleme Tetiklendi:", id, newStatus);
    setLoadingId(id);
    startTransition(async () => {
      try {
        const res = await updateBookingStatus(id, newStatus);
        if (!res.success) {
          const errorMsg = typeof res.error === 'string' ? res.error : JSON.stringify(res.error);
          alert(`Hata: ${errorMsg}\n\nEğer ID Mismatch hatası alıyorsanız, veritabanı ID'si ile butondaki ID uyuşmuyor demektir.`);
        }
      } catch (err: any) {
        alert("Bağlantı hatası: " + err.message);
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
    
    console.log("[DEBUG] Thanos Snap Başlatıldı:", id);
    setDeleteConfirm(null);
    
    // Thanos Snap Animasyonunu Başlat
    setDeletingIds(prev => new Set(prev).add(id));
    
    // Animasyon süresi kadar bekle (0.8s)
    await new Promise(resolve => setTimeout(resolve, 800));

    startTransition(async () => {
      try {
        const res = type === "booking" ? await deleteBooking(id) : await deleteLead(id);
        if (!res.success) {
          alert(`Silme başarısız: ${res.error}`);
          setDeletingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      } catch (err: any) {
        alert("Silme sırasında hata oluştu: " + err.message);
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="badge-approved" style={{ padding: "0.4rem 0.8rem", background: "#dcfce3", color: "#166534", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><Check size={12}/> Onaylandı</span>;
      case "cancelled":
        return <span className="badge-cancelled" style={{ padding: "0.4rem 0.8rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><X size={12}/> İptal Edildi</span>;
      default:
        return <span className="badge-pending" style={{ padding: "0.4rem 0.8rem", background: "#fef9c3", color: "#854d0e", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><Clock size={12}/> Bekliyor</span>;
    }
  };

  return (
    <div className="admin-dashboard">
      
      {/* Header with Tabs */}
      <div className="admin-header">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
            Randevular ({initialBookings.length})
          </button>
          <button className={`tab-btn ${activeTab === "leads" ? "active" : ""}`} onClick={() => setActiveTab("leads")}>
            Teklif Talepleri ({initialLeads.length})
          </button>
        </div>
        
        <button className="add-btn" onClick={() => setShowAddModal(activeTab === "bookings" ? "booking" : "lead")}>
          <Plus size={16} /> Manuel Ekle
        </button>
      </div>

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
              {initialBookings.map((b) => (
                <tr key={b.id} className={deletingIds.has(b.id) ? "thanos-snap" : ""}>
                  <td><strong>{b.date}</strong><br/><small>{b.time}</small></td>
                  <td><strong>{b.name}</strong><br/><small>{b.phone}</small></td>
                  <td>{b.service}</td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td>
                    <div className="action-group">
                      {loadingId === b.id ? <Loader2 className="spin" size={20} /> : (
                        <>
                          <button className="btn-approve" onClick={() => handleStatusUpdate(b.id, "approved")} disabled={b.status === "approved"}><Check size={16}/></button>
                          <button className="btn-cancel" onClick={() => handleStatusUpdate(b.id, "cancelled")} disabled={b.status === "cancelled"}><X size={16}/></button>
                          <button className="btn-delete" onClick={() => handleDeleteTrigger(b.id, "booking")}><Trash2 size={16}/></button>
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
              {initialLeads.map((l) => (
                <tr key={l.id} className={deletingIds.has(l.id) ? "thanos-snap" : ""}>
                  <td><small>{new Date(l.created_at).toLocaleString('tr-TR')}</small></td>
                  <td><strong>{l.name}</strong><br/><small>{l.phone}</small></td>
                  <td>{l.service}</td>
                  <td><span className="source-tag">{l.source}</span></td>
                  <td>
                    {loadingId === l.id ? <Loader2 className="spin" size={20} /> : (
                      <button className="btn-delete" onClick={() => handleDeleteTrigger(l.id, "lead")}><Trash2 size={16}/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Luxury Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(26, 26, 26, 0.85)", backdropFilter: "blur(12px)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: "420px", borderRadius: "2rem", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.3)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="modal-header" style={{ padding: "3rem 2rem 2rem", textAlign: "center" }}>
              <div className="icon-box-danger" style={{ width: "80px", height: "80px", background: "rgba(239, 68, 68, 0.05)", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-primary)", fontWeight: 400 }}>İşlemi Onayla</h3>
              <p style={{ margin: 0, color: "var(--color-charcoal-muted)", fontSize: "0.95rem", lineHeight: 1.6, padding: "0 1rem" }}>
                Bu kaydı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="modal-actions" style={{ padding: "1.5rem 2rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button 
                className="btn-secondary" 
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: "1rem", background: "#f8f8f8", border: "1px solid #eee", borderRadius: "1rem", cursor: "pointer", fontWeight: 600, color: "var(--color-charcoal)", transition: "all 0.2s" }}
              >
                Vazgeç
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete} 
                disabled={isPending}
                style={{ padding: "1rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "1rem", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                {isPending ? <Loader2 size={18} className="spin" /> : "Kaydı Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal (Basit versiyon) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <div className="modal-header">
                <h3>{showAddModal === "booking" ? "Yeni Manuel Randevu" : "Yeni Manuel Talep"}</h3>
             </div>
             <form className="admin-form" onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setLoadingId("manual");
                startTransition(async () => {
                  if (showAddModal === "booking") {
                    await createManualBooking({
                      name: fd.get("name") as string,
                      phone: fd.get("phone") as string,
                      service: fd.get("service") as string,
                      date: fd.get("date") as string,
                      time: fd.get("time") as string,
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
             }}>
                <input name="name" placeholder="İsim" required />
                <input name="phone" placeholder="Telefon" required />
                <input name="service" placeholder="Hizmet" required />
                {showAddModal === "booking" && (
                  <>
                    <input name="date" type="date" required />
                    <input name="time" placeholder="Saat (Örn: 14:30)" required />
                  </>
                )}
                <button type="submit" disabled={isPending} className="btn-submit">Kaydet</button>
             </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard { padding: 2rem; color: var(--color-primary); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .tabs { display: flex; gap: 1rem; }
        .tab-btn { padding: 0.8rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #666; font-weight: 600; }
        .tab-btn.active { border-bottom-color: var(--color-gold); color: var(--color-primary); }
        .add-btn { background: var(--color-primary); color: #fff; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        
        .table-container { background: #fff; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid rgba(212,175,55,0.1); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { padding: 1.2rem; background: #fafafa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; }
        .admin-table td { padding: 1.2rem; border-bottom: 1px solid #f0f0f0; }
        
        .action-group { display: flex; gap: 0.75rem; justify-content: center; align-items: center; }
        .action-group button { 
          width: 36px; 
          height: 36px; 
          border-radius: 12px; 
          border: 1px solid rgba(0,0,0,0.05); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fff;
          padding: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .btn-approve:hover { background: #dcfce3; color: #166534; border-color: #86efac; transform: translateY(-2px); }
        .btn-cancel:hover { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; transform: translateY(-2px); }
        .btn-delete:hover { background: #1a1a1a; color: #fff; border-color: #1a1a1a; transform: translateY(-2px); }
        .btn-delete:hover :global(svg) { animation: lid-open 0.3s forwards; }

        @keyframes lid-open {
          0% { transform: rotate(0deg) translateY(0); }
          100% { transform: rotate(-15deg) translateY(-2px); }
        }

        .thanos-snap {
          animation: thanos-dust 0.8s ease-in forwards !important;
          pointer-events: none;
        }

        @keyframes thanos-dust {
          0% { 
            opacity: 1; 
            transform: scale(1); 
            filter: blur(0) grayscale(0);
          }
          30% {
            transform: scale(1.02) translateY(-2px);
            filter: blur(1px) grayscale(0.5);
          }
          100% { 
            opacity: 0; 
            transform: scale(1.05) translateY(-10px); 
            filter: blur(15px) grayscale(1) sepia(1) hue-rotate(15deg);
          }
        }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justifyContent: center; }
        .modal-content { background: #fff; width: 90%; maxWidth: 450px; border-radius: 20px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal-header { text-align: center; margin-bottom: 1.5rem; }
        .icon-box-danger { width: 60px; height: 60px; background: #fee2e2; color: #ef4444; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; margin: 0 auto 1rem; }
        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
        .btn-secondary { padding: 0.8rem; background: #eee; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .btn-danger { padding: 0.8rem; background: #ef4444; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
        
        .admin-form { display: flex; flex-direction: column; gap: 1rem; }
        .admin-form input { padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; }
        .btn-submit { background: var(--color-gold); color: #fff; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 700; }
        
        .badge-approved { background: #dcfce3; color: #166534; padding: 0.3rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
        .badge-cancelled { background: #fee2e2; color: #b91c1c; padding: 0.3rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
        .badge-pending { background: #fef9c3; color: #854d0e; padding: 0.3rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
        .source-tag { font-size: 0.7rem; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; color: #777; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
