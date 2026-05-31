import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

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

  // Takvim başlangıcını 'bugün' olarak al (Client ile senkron)
  const weekOffset = parseInt(sp.week ?? "0", 10);
  const now = new Date();

  const localYear  = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate  = now.getDate();

  const startDate  = new Date(localYear, localMonth, localDate + weekOffset * 7);
  const endDate = new Date(localYear, localMonth, localDate + weekOffset * 7 + 5);

  const fmt = (d: Date) => {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const startStr = fmt(startDate);
  const endStr = fmt(endDate);

  // Bu haftanın randevuları
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, name, phone, service, date, time, status, note")
    .gte("date", startStr)
    .lte("date", endStr)
    .order("time", { ascending: true });

  // Müşteri ziyaret sayıları
  const phones = [...new Set((bookings ?? []).map((b) => b.phone))];
  const visitMap: Record<string, number> = {};
  if (phones.length > 0) {
    const { data: allVisits } = await supabase
      .from("bookings")
      .select("phone")
      .in("phone", phones);
    for (const v of allVisits ?? []) {
      visitMap[v.phone] = (visitMap[v.phone] ?? 0) + 1;
    }
  }

  return (
    <div style={{ padding: "2.5rem 1.5rem", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0, fontWeight: 400, letterSpacing: "-0.02em" }}>
            Randevu <span style={{ fontStyle: "italic", color: "var(--color-gold)", fontWeight: 300 }}>Takvimi</span>
          </h1>
          <p style={{ color: "var(--color-charcoal-muted)", fontSize: "0.9rem", marginTop: "0.4rem", fontWeight: 400 }}>
            {startDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} –{" "}
            {endDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <CalendarClient
          bookings={bookings ?? []}
          visitMap={visitMap}
          weekOffset={weekOffset}
          mondayIso={startStr}
          locale={locale}
        />
      </div>
    </div>
  );
}
