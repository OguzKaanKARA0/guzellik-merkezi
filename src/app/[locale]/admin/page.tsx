import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { LogOut } from "lucide-react";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const supabase = await createClient();
  
  // Güvenlik Doğrulaması
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  // Randevuları Supabase üzerinden çek (En yeni en üstte)
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  // Teklif Taleplerini (Leads) Supabase üzerinden çek
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
              Luxe <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>Yönetim</span>
            </h1>
            <p style={{ color: "var(--color-charcoal-muted)", fontSize: "0.95rem", marginTop: "0.35rem" }}>
              Tüm randevuları buradan yönetebilirsiniz. Hoş geldin, <strong style={{ color: "var(--color-primary)" }}>{user.email}</strong>.
            </p>
          </div>
          
          <form action={logout}>
            <button 
              type="submit" 
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", padding: "0.75rem 1.5rem", borderRadius: "99px", color: "var(--color-charcoal)", cursor: "pointer", transition: "all 0.2s" }}
            >
              <LogOut size={16} style={{ color: "var(--color-gold)" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Çıkış Yap</span>
            </button>
          </form>
        </div>

        {/* Dashboard Content (Client Component) */}
        <AdminDashboardClient 
          initialBookings={bookings || []} 
          initialLeads={leads || []}
        />

      </div>
    </div>
  );
}
