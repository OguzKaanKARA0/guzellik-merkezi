"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Admin işlemleri için RLS'yi bypass eden yetkili istemci
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateBookingStatus(id: string, newStatus: "approved" | "cancelled") {
  console.log(`[admin-action] Durum güncelleniyor: ${id} -> ${newStatus}`);
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[admin-action] Güncelleme hatası:", error);
      return { success: false, error: error.message };
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
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id)
      .select();
    
    if (error) {
      console.error("[admin-action] Silme hatası (booking):", error);
      return { success: false, error: error.message };
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
    const { data, error } = await supabaseAdmin
      .from("leads")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("[admin-action] Silme hatası (lead):", error);
      return { success: false, error: error.message };
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
