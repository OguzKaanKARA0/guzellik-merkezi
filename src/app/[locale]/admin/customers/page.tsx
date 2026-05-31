import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { CustomersClient } from "./CustomersClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);

  // Plan guard — service role key ile RLS bypass
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

  // Tüm bookings'i çek
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, name, phone, service, date, status")
    .order("date", { ascending: false });

  // Phone'a göre aggregate → müşteri listesi
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    visits: number;
    lastDate: string;
    services: Map<string, number>;
  }>();

  for (const b of bookings ?? []) {
    const key = b.phone;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: b.name,
        phone: b.phone,
        visits: 0,
        lastDate: b.date,
        services: new Map(),
      });
    }
    const c = customerMap.get(key)!;
    c.visits += 1;
    if (b.date > c.lastDate) { c.lastDate = b.date; c.name = b.name; }
    c.services.set(b.service, (c.services.get(b.service) ?? 0) + 1);
  }

  const customers = Array.from(customerMap.values()).map((c) => {
    let topService = "";
    let topCount = 0;
    c.services.forEach((count, svc) => { if (count > topCount) { topCount = count; topService = svc; } });
    return { name: c.name, phone: c.phone, visits: c.visits, lastDate: c.lastDate, topService };
  }).sort((a, b) => b.visits - a.visits);

  return (
    <div style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
            Müşteri <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>Defteri</span>
          </h1>
          <p style={{ color: "var(--color-charcoal-muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
            {customers.length} benzersiz müşteri
          </p>
        </div>

        <CustomersClient customers={customers} locale={locale} />
      </div>
    </div>
  );
}
