"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Admin Actions Bundle
 * @description Bu dosya, Luxe Beauty CRM'in yönetimsel operasyonlarını (Update/Delete/Create) içerir.
 * Güvenlik Mimarisi:
 * - Admin işlemleri, sunucu tarafında (Server Actions) 'supabaseAdmin' istemcisi ile yürütülür.
 * - 'supabaseAdmin', veritabanı RLS (Row Level Security) politikalarını bypass eden 
 *   'service_role' anahtarını kullanır. Bu, yöneticiye tam yetki sağlar.
 * - Tüm işlemlerden sonra 'revalidatePath' ile UI senkronizasyonu anında gerçekleştirilir.
 */
 


export async function updateBookingStatus(id: string, newStatus: "approved" | "cancelled") {
  console.log(`[admin-action] Durum güncelleniyor: ${id} -> ${newStatus}`);
  try {
    const supabaseAdmin = await createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[admin-action] Güncelleme hatası:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error("[admin-action] GÜNCELLEME BAŞARISIZ: Bu ID ile bir kayıt bulunamadı ->", id);
      return { success: false, error: "Güncellenecek kayıt bulunamadı. (ID Mismatch)" };
    }

    console.log("[admin-action] Güncelleme başarılı:", data);
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (err) {
    console.error("[admin-action] Beklenmeyen hata:", err);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function deleteBooking(id: string) {
  console.log(`[admin-action] Rezervasyon siliniyor: ${id}`);
  try {
    const supabaseAdmin = await createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id)
      .select();
    
    if (error) {
      console.error("[admin-action] Silme hatası (booking):", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error("[admin-action] SİLME BAŞARISIZ: Bu ID ile bir kayıt bulunamadı ->", id);
      return { success: false, error: "Silinecek kayıt bulunamadı. (ID Mismatch)" };
    }

    console.log("[admin-action] Silme başarılı (booking):", data);
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (err) {
    console.error("[admin-action] Beklenmeyen hata:", err);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function deleteLead(id: string) {
  console.log(`[admin-action] Lead siliniyor: ${id}`);
  try {
    const supabaseAdmin = await createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("leads")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("[admin-action] Silme hatası (lead):", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error("[admin-action] SİLME BAŞARISIZ: Bu ID ile bir lead kaydı bulunamadı ->", id);
      return { success: false, error: "Silinecek talep bulunamadı. (ID Mismatch)" };
    }

    console.log("[admin-action] Silme başarılı (lead):", data);
    revalidatePath("/", "layout");
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (err) {
    console.error("[admin-action] Beklenmeyen hata:", err);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function createManualBooking(data: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  note?: string;
}) {
  console.log("[admin-action] Manuel rezervasyon ekleniyor:", data);
  try {
    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin.from("bookings").insert([{
      ...data,
      status: "approved"
    }]);

    if (error) {
      console.error("[admin-action] Manuel ekleme hatası (booking):", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (err) {
    console.error("[admin-action] Beklenmeyen hata:", err);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function createManualLead(data: {
  name: string;
  phone: string;
  service: string;
  source: string;
}) {
  console.log("[admin-action] Manuel lead ekleniyor:", data);
  try {
    const supabaseAdmin = await createAdminClient();
    const { error } = await supabaseAdmin.from("leads").insert([data]);

    if (error) {
      console.error("[admin-action] Manuel ekleme hatası (lead):", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/[locale]/admin", "page");
    return { success: true };
  } catch (err) {
    console.error("[admin-action] Beklenmeyen hata:", err);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function logout() {
  redirect("/");
}
