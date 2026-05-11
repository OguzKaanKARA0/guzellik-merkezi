import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { LogOut, MessageCircle } from "lucide-react";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const PLAN_FEATURES = {
  basic:   { admin_panel: false },
  pro:     { admin_panel: true  },
  ai_plus: { admin_panel: true  },
} as const;

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const supabase = await createClient();

  // Güvenlik Doğrulaması
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  // Plan kontrolü — Service Role Key ile RLS'yi atlayarak sorgu yap
  // (createClient() anon key ile çalışır, RLS salonlar tablosunu engeller)
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const salonId = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID

  console.log('[page.tsx] salon id:', salonId)
  console.log('[page.tsx] user.email:', user.email)

  const { data: salon, error: salonError } = await adminSupabase
    .from("salons")
    .select("plan_type, plan_expires_at")
    .eq("id", salonId!)
    .maybeSingle();

  console.log('[page.tsx] salon data:', salon)
  console.log('[page.tsx] salon error:', salonError)

  const expired = salon?.plan_expires_at && new Date(salon.plan_expires_at) < new Date();
  const plan = (salon?.plan_type ?? "basic") as keyof typeof PLAN_FEATURES;
  const canAccessAdmin = !expired && PLAN_FEATURES[plan]?.admin_panel;

  console.log('[page.tsx] plan:', plan, '| expired:', expired, '| canAccessAdmin:', canAccessAdmin)

  if (!canAccessAdmin) {
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const waText = encodeURIComponent("Merhaba! Pro pakete geçmek istiyorum.");
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,169,110,0.3)" }}>
            <MessageCircle size={36} style={{ color: "var(--color-gold)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
            Admin Paneli
          </h1>
          <p style={{ color: "var(--color-charcoal-muted)", lineHeight: 1.7, margin: 0 }}>
            Basic pakette admin paneli bulunmuyor.<br />
            Pro pakete geçmek için iletişime geçin.
          </p>
          <a
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "#25d366", color: "#fff", padding: "1rem 2.5rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", letterSpacing: "0.05em" }}
          >
            <MessageCircle size={18} />
            WHATSAPP&apos;TAN YAZ
          </a>
        </div>
      </div>
    );
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
