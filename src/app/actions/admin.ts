"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/* --- DELETE OPERATIONS --- */

export async function deleteBooking(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  
  if (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    console.error("Error deleting lead:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/* --- CREATE OPERATIONS (MANUAL) --- */

export async function createManualBooking(data: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  note?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert([{
    ...data,
    status: "approved" // Admin tarafından eklenenler direkt onaylı sayılabilir
  }]);

  if (error) {
    console.error("Error creating manual booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createManualLead(data: {
  name: string;
  phone: string;
  service: string;
  source: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert([{
    ...data
  }]);

  if (error) {
    console.error("Error creating manual lead:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
