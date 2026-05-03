import { LoginForm } from "./LoginForm";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "var(--color-bg)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorative Elements */}
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
      
      <LoginForm locale={locale} />
    </div>
  );
}
