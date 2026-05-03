"use client";

import { useState, useTransition } from "react";
import { login } from "./actions";
import { Loader2 } from "lucide-react";

export function LoginForm({ locale }: { locale: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("locale", locale);

    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) {
        setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px", padding: "3rem 2.5rem", background: "#fff", borderRadius: "1.25rem", boxShadow: "0 24px 64px rgba(0,0,0,0.06), 0 0 0 1px rgba(212,175,55,0.15)", position: "relative", zIndex: 10 }}>
      
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold)" }}>
          Yetkili Girişi
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--color-primary)", margin: 0, fontWeight: 400 }}>
          Luxe <span style={{ fontStyle: "italic", color: "var(--color-gold)" }}>Admin</span>
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-charcoal-light)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            E-Posta Adresi
          </label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="admin@luxebeauty.com"
            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.5rem", border: "1.5px solid rgba(212,175,55,0.25)", outline: "none", fontSize: "0.95rem", color: "var(--color-primary)", transition: "border-color 0.2s" }} 
            onFocus={(e) => e.target.style.borderColor = "var(--color-gold)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(212,175,55,0.25)"}
          />
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-charcoal-light)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Şifre
          </label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.5rem", border: "1.5px solid rgba(212,175,55,0.25)", outline: "none", fontSize: "0.95rem", color: "var(--color-primary)", transition: "border-color 0.2s" }} 
            onFocus={(e) => e.target.style.borderColor = "var(--color-gold)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(212,175,55,0.25)"}
          />
        </div>

        {error && (
          <div style={{ padding: "0.85rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "0.5rem", fontSize: "0.85rem", textAlign: "center", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <button 
          disabled={isPending} 
          type="submit" 
          className="btn-gold" 
          style={{ width: "100%", padding: "1rem", marginTop: "1rem", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.95rem", fontWeight: 500, letterSpacing: "0.05em", opacity: isPending ? 0.7 : 1, cursor: isPending ? "not-allowed" : "pointer" }}
        >
          {isPending ? (
            <><Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: "0.5rem" }} /> Giriş Yapılıyor...</>
          ) : "Giriş Yap"}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
