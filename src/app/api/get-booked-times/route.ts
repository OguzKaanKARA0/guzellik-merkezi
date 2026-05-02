import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ ok: false, error: "Date parameter is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("bookings")
      .select("time")
      .eq("date", date);

    if (error) {
      console.error("[get-booked-times] DB Error:", error);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    const bookedTimes = data.map((b) => b.time);
    return NextResponse.json({ ok: true, bookedTimes });
  } catch (err) {
    console.error("[get-booked-times] Server error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
