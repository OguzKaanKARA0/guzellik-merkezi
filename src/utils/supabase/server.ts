import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createPureClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component içinden setAll çağrılırsa hata fırlatabilir.
          }
        },
      },
    }
  );
}

/**
 * createAdminClient
 * @description RLS (Row Level Security) politikalarını bypass eden yetkili istemci.
 * Çerezlere veya oturum bilgisine ihtiyaç duymaz, doğrudan servis anahtarı ile çalışır.
 * Sadece güvenli sunucu tarafı işlemlerinde (Server Actions) kullanılmalıdır.
 */
export async function createAdminClient() {
  return createPureClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
