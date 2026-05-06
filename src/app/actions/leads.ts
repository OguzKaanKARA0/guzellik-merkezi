"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * createLead
 * @description Yeni bir potansiyel müşteri (lead) kaydı oluşturur. 
 * Bu fonksiyon, Supabase CRM entegrasyonunun temelini oluşturur.
 * RLS (Row Level Security) politikalarına tam uyumludur; anonim kullanıcılara 
 * sadece INSERT izni verildiği senaryolarda güvenli bir şekilde çalışır.
 * Sunucu tarafında (Server Actions) çalıştığı için veri güvenliğini garanti eder.
 */
export async function createLead(name: string, phone: string, service: string | null) {
  console.log("[createLead] İşlem başlatıldı:", { name, phone, service });

  try {
    const supabase = await createClient();
    
    // Zorunlu alan kontrolü
    if (!name || !phone) {
      console.error("[createLead] Hata: İsim veya telefon eksik.");
      return { success: false, error: "İsim ve telefon alanları zorunludur." };
    }

    console.log("[createLead] Supabase'e ekleniyor...");
    const { data, error } = await supabase.from("leads").insert([
      {
        name,
        phone,
        service: (service && service.trim() !== "") ? service : "Genel Bilgi Talebi",
        source: "WhatsApp_Offer"
      }
    ]).select();

    if (error) {
      console.error("[createLead] Supabase hatası:", error);
      return { success: false, error: `Veritabanı hatası: ${error.message}` };
    }

    console.log("[createLead] Başarıyla eklendi:", data);
    
    revalidatePath("/", "layout");
    return { success: true };

  } catch (err) {
    console.error("[createLead] Beklenmeyen hata:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." 
    };
  }
}
