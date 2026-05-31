"use client";

import { useState, useMemo } from "react";
import { Search, Download, User, Phone, Calendar, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Customer = {
  name: string;
  phone: string;
  visits: number;
  lastDate: string;
  topService: string;
};

export function CustomersClient({
  customers,
  locale,
}: {
  customers: Customer[];
  locale: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, query]);

  const handleExportCsv = () => {
    const header = ["İsim", "Telefon", "Toplam Ziyaret", "Son Randevu", "En Çok Alınan Hizmet"];
    const rows = filtered.map((c) => [
      c.name,
      c.phone,
      c.visits,
      c.lastDate,
      c.topService,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `musteriler_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateToProfile = (phone: string) => {
    const encoded = encodeURIComponent(phone);
    router.push(`/${locale}/admin/customers/${encoded}`);
  };

  return (
    <>
      <style>{`
        .cust-toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap; }
        .cust-search-wrap { flex: 1; min-width: 220px; position: relative; }
        .cust-search { width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem; border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 10px; font-size: 0.9rem; background: #FAF7F2; color: #2C1810; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .cust-search:focus { border-color: #C9A96E; }
        .cust-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #C9A96E; opacity: 0.7; pointer-events: none; }
        .cust-export-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.4rem; background: #2C1810; color: #FAF7F2; border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; letter-spacing: 0.04em; transition: background 0.2s; white-space: nowrap; }
        .cust-export-btn:hover { background: #C9A96E; color: #FAF7F2; }
        .cust-table-wrap { background: #FAF7F2; border-radius: 16px; box-shadow: 0 10px 30px rgba(44, 24, 16, 0.04); overflow: hidden; border: 1px solid rgba(201, 169, 110, 0.15); }
        .cust-table { width: 100%; border-collapse: collapse; }
        .cust-table th { padding: 1.1rem 1.25rem; background: #FAF7F2; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: #2C1810; opacity: 0.6; font-weight: 700; text-align: left; border-bottom: 1px solid rgba(201, 169, 110, 0.15); font-family: var(--font-serif); }
        .cust-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid rgba(201, 169, 110, 0.08); vertical-align: middle; font-size: 0.9rem; color: #2C1810; }
        .cust-table tr:last-child td { border-bottom: none; }
        .cust-row { cursor: pointer; transition: background 0.15s; }
        .cust-row:hover { background: rgba(201, 169, 110, 0.08); }
        .cust-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; background: rgba(201, 169, 110, 0.12); color: #C9A96E; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
        .cust-service-chip { font-size: 0.78rem; background: rgba(44, 24, 16, 0.05); padding: 0.25rem 0.65rem; border-radius: 6px; color: #2C1810; opacity: 0.85; font-family: var(--font-serif); }
        .cust-arrow { color: #2C1810; opacity: 0.3; transition: all 0.2s; }
        .cust-row:hover .cust-arrow { color: #C9A96E; opacity: 1; transform: translateX(2px); }
        .cust-empty { text-align: center; padding: 4rem; color: #2C1810; opacity: 0.5; font-size: 0.95rem; }
        @media(max-width:768px){
          .cust-table th:nth-child(4), .cust-table td:nth-child(4),
          .cust-table th:nth-child(5), .cust-table td:nth-child(5) { display: none; }
        }
      `}</style>


      {/* Toolbar */}
      <div className="cust-toolbar">
        <div className="cust-search-wrap">
          <Search size={16} className="cust-search-icon" />
          <input
            className="cust-search"
            type="text"
            placeholder="İsim veya telefon ile ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="cust-export-btn" onClick={handleExportCsv}>
          <Download size={16} />
          CSV İndir
        </button>
      </div>

      {/* Table */}
      <div className="cust-table-wrap">
        <table className="cust-table">
          <thead>
            <tr>
              <th><User size={11} style={{ display: "inline", marginRight: 4 }} />Müşteri</th>
              <th><Phone size={11} style={{ display: "inline", marginRight: 4 }} />Telefon</th>
              <th><Calendar size={11} style={{ display: "inline", marginRight: 4 }} />Ziyaret</th>
              <th>Son Randevu</th>
              <th><Star size={11} style={{ display: "inline", marginRight: 4 }} />En Çok Alınan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="cust-empty">
                  {query ? "Aramanızla eşleşen müşteri bulunamadı." : "Henüz müşteri kaydı yok."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.phone} className="cust-row" onClick={() => navigateToProfile(c.phone)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "rgba(201,169,110,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontWeight: 700, fontSize: "0.8rem",
                        color: "#C9A96E",
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ fontSize: "0.9rem" }}>{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: "#777", fontSize: "0.85rem" }}>{c.phone}</td>
                  <td>
                    <span className="cust-badge">
                      {c.visits} ziyaret
                    </span>
                  </td>
                  <td style={{ color: "#777", fontSize: "0.85rem" }}>
                    {c.lastDate
                      ? new Date(c.lastDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </td>
                  <td>
                    {c.topService
                      ? <span className="cust-service-chip">{c.topService}</span>
                      : <span style={{ color: "#ddd" }}>—</span>}
                  </td>
                  <td>
                    <ArrowRight size={16} className="cust-arrow" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p style={{ textAlign: "right", fontSize: "0.78rem", color: "#bbb", marginTop: "0.75rem" }}>
          {filtered.length} müşteri gösteriliyor
        </p>
      )}
    </>
  );
}
