import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { CustomerProfileClient } from "./CustomerProfileClient";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const phone = decodeURIComponent(id);

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);

  // Plan guard
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const salonId = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID;
  const { data: salon } = await adminSupabase
    .from("salons")
    .select("plan_type, plan_expires_at")
    .eq("id", salonId!)
    .maybeSingle();

  const expired = salon?.plan_expires_at && new Date(salon.plan_expires_at) < new Date();
  const plan = salon?.plan_type ?? "basic";
  const canAccess = !expired && (plan === "pro" || plan === "ai_plus");
  if (!canAccess) redirect(`/${locale}/admin`);

  // Bu müşterinin tüm randevuları
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, name, phone, service, date, time, status, note")
    .eq("phone", phone)
    .order("date", { ascending: false });

  if (!bookings || bookings.length === 0) {
    redirect(`/${locale}/admin/customers`);
  }

  const customer = { name: bookings[0].name, phone };

  // Müşteri notu — customer_notes tablosundan (yoksa null)
  const { data: noteRow } = await adminSupabase
    .from("customer_notes")
    .select("note")
    .eq("phone", phone)
    .maybeSingle();

  const existingNote = noteRow?.note ?? "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Back link */}
        <a
          href={`/${locale}/admin/customers`}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-gold, #D4AF37)", textDecoration: "none", marginBottom: "2rem", letterSpacing: "0.03em" }}
        >
          <ArrowLeft size={15} /> Müşteri Defterine Dön
        </a>

        {/* Customer info card */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "2.5rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          borderTop: "4px solid var(--color-gold, #D4AF37)",
          display: "flex",
          alignItems: "center",
          gap: "1.75rem",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(212,175,55,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.75rem", fontWeight: 700,
            color: "var(--color-gold, #D4AF37)",
            flexShrink: 0,
          }}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary, #2C1810)", margin: "0 0 0.25rem", fontWeight: 400 }}>
              {customer.name}
            </h1>
            <p style={{ margin: 0, color: "#888", fontSize: "0.95rem" }}>
              📞 {customer.phone} · <strong style={{ color: "var(--color-gold, #D4AF37)" }}>{bookings.length}</strong> toplam randevu
            </p>
          </div>
        </div>

        <CustomerProfileClient
          bookings={bookings}
          phone={phone}
          locale={locale}
          existingNote={existingNote}
        />
      </div>
    </div>
  );
}
