"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard, CalendarDays, Users, CalendarCheck,
  MessageSquare, LogOut, Menu, X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exactMatch?: boolean;
};

export function AdminSidebar({ locale, userEmail }: { locale: string; userEmail?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = `/${locale}/admin`;

  const navItems: NavItem[] = [
    { label: "Dashboard",        href: base,                   icon: <LayoutDashboard size={17} />, exactMatch: true },
    { label: "Takvim",           href: `${base}/calendar`,     icon: <CalendarDays size={17} /> },
    { label: "Müşteri Defteri",  href: `${base}/customers`,    icon: <Users size={17} /> },
    { label: "Randevular",       href: base,                   icon: <CalendarCheck size={17} />, exactMatch: true },
    { label: "Teklif Talepleri", href: base,                   icon: <MessageSquare size={17} />, exactMatch: true },
  ];

  const isActive = (item: NavItem) => {
    if (item.exactMatch) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/admin/login`;
  };

  const SidebarContent = () => (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: "#2C1810", color: "#FAF7F2",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.75rem 1.5rem 1.25rem", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, color: "#FAF7F2", letterSpacing: "-0.01em" }}>
          Luxe <span style={{ color: "#C9A96E", fontStyle: "italic" }}>Admin</span>
        </div>
        {userEmail && (
          <div style={{ fontSize: "0.7rem", color: "rgba(250,247,242,0.4)", marginTop: "0.3rem", fontWeight: 500, letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem", fontFamily: "var(--font-sans)" }}>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <a
               key={item.label + item.href}
               href={item.href}
               onClick={() => setMobileOpen(false)}
               style={{
                 display: "flex", alignItems: "center", gap: "0.7rem",
                 padding: "0.65rem 0.875rem",
                 borderRadius: "10px",
                 textDecoration: "none",
                 fontSize: "0.875rem",
                 fontWeight: active ? 700 : 500,
                 color: active ? "#C9A96E" : "rgba(250,247,242,0.65)",
                 background: active ? "rgba(201,169,110,0.12)" : "transparent",
                 borderLeft: active ? "3px solid #C9A96E" : "3px solid transparent",
                 transition: "all 0.15s ease",
               }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(201,169,110,0.15)", fontFamily: "var(--font-sans)" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "0.7rem",
            padding: "0.65rem 0.875rem", borderRadius: "10px",
            border: "none", background: "transparent",
            color: "rgba(250,247,242,0.5)",
            fontSize: "0.875rem", fontWeight: 500,
            cursor: "pointer", textAlign: "left",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(250,247,242,0.5)"; }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .admin-sb-desktop { width: 240px; min-height: 100vh; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .admin-sb-burger { display: none; position: fixed; top: 1rem; left: 1rem; z-index: 1001; width: 38px; height: 38px; border-radius: 9px; background: #2C1810; border: none; color: #C9A96E; cursor: pointer; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
        @media(max-width:768px){ .admin-sb-desktop{ display: none; } .admin-sb-burger{ display: flex; } }
      `}</style>


      {/* Desktop */}
      <aside className="admin-sb-desktop">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button className="admin-sb-burger" onClick={() => setMobileOpen(true)}>
        <Menu size={19} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", zIndex: 1, width: 240, height: "100vh", flexShrink: 0 }}>
            <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "1rem", right: "-2.75rem", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
              <X size={22} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
