import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Login sayfasında (oturum yoksa) sidebar gösterme
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--color-bg)" }}>
      <AdminSidebar locale={locale} userEmail={user.email} />
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
