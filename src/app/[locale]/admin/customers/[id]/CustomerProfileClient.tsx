"use client";

import { useState } from "react";
import { Check, X, Clock, Save, Loader2 } from "lucide-react";
import { saveCustomerNote } from "../../actions";

type Booking = {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: string;
  note: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span style={{ padding: "0.3rem 0.7rem", background: "#dcfce3", color: "#166534", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <Check size={11} /> Onaylı
      </span>
    );
  if (status === "cancelled")
    return (
      <span style={{ padding: "0.3rem 0.7rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <X size={11} /> İptal
      </span>
    );
  return (
    <span style={{ padding: "0.3rem 0.7rem", background: "#fef9c3", color: "#854d0e", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
      <Clock size={11} /> Bekliyor
    </span>
  );
}

export function CustomerProfileClient({
  bookings,
  phone,
  locale,
  existingNote,
}: {
  bookings: Booking[];
  phone: string;
  locale: string;
  existingNote: string;
}) {
  const [note, setNote] = useState(existingNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveCustomerNote(phone, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Not kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .hist-table { width: 100%; border-collapse: collapse; }
        .hist-table th { padding: 1rem 1.25rem; background: #fafafa; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa; font-weight: 700; text-align: left; border-bottom: 1px solid #f0f0f0; }
        .hist-table td { padding: 1rem 1.25rem; border-bottom: 1px solid #f8f8f8; vertical-align: middle; font-size: 0.88rem; color: var(--color-primary, #2C1810); }
        .hist-table tr:last-child td { border-bottom: none; }
        .note-textarea { width: 100%; min-height: 130px; padding: 1rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 10px; font-size: 0.9rem; font-family: var(--font-sans, sans-serif); color: var(--color-primary, #2C1810); background: #fff; resize: vertical; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .note-textarea:focus { border-color: var(--color-gold, #D4AF37); }
        .save-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; background: var(--color-primary, #2C1810); color: #fff; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .save-btn:hover:not(:disabled) { background: var(--color-gold, #D4AF37); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .saved-msg { font-size: 0.82rem; color: #22c55e; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem; }
      `}</style>

      {/* Randevu Geçmişi */}
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid rgba(212,175,55,0.1)", marginBottom: "2rem" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f5f5f5" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-primary, #2C1810)", margin: 0, fontWeight: 400 }}>
            Randevu Geçmişi
          </h2>
        </div>
        <table className="hist-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Hizmet</th>
              <th>Durum</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>
                    {b.date
                      ? new Date(b.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </strong>
                </td>
                <td style={{ color: "#888" }}>{b.time || "—"}</td>
                <td>{b.service}</td>
                <td><StatusBadge status={b.status} /></td>
                <td style={{ color: "#999", fontSize: "0.82rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {b.note || <span style={{ color: "#ddd" }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Müşteri Notu */}
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(212,175,55,0.1)", padding: "1.75rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-primary, #2C1810)", margin: "0 0 1rem", fontWeight: 400 }}>
          Müşteri Notu
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#aaa", marginBottom: "0.85rem" }}>
          Bu not sadece salon yönetimine görünür.
        </p>
        <textarea
          className="note-textarea"
          placeholder="Bu müşteri hakkında özel notlar ekleyin... (tercihler, alerji bilgileri, vb.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {saved && (
            <span className="saved-msg">
              <Check size={14} /> Not kaydedildi
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
