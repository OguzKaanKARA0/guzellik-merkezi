import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

/* ── İstemciler (modül seviyesi singleton) ── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!      // RLS'yi bypass eder, güvenli
);

const resend = new Resend(process.env.RESEND_API_KEY);

/* ─────────────────────────────────────────────────────
   POST /api/send-booking

   Akış:
     1) Validasyon
     2) Supabase → "bookings" tablosuna kaydet
     3) Resend → salon sahibine bildirim e-postası gönder
───────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, date, time, note, locale } = body;

    /* ── Adım 1: Validasyon ── */
    if (!name || !phone || !email || !service || !date || !time) {
      return NextResponse.json(
        { ok: false, error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    const isEN = locale === "en";

    /* ── Adım 2: Supabase'e kaydet ── */
    const { data, error: dbError } = await supabase
      .from("bookings")
      .insert([
        {
          name,
          phone,
          email,
          service,
          date,
          time,
          note: note ?? "",
          locale,
          status: "pending",
          source: "website",
        },
      ])
      .select("id")
      .single();

    if (dbError) {
      console.error("[send-booking] Supabase DB hatası:", dbError);
      return NextResponse.json(
        { ok: false, error: "Rezervasyon kaydedilemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    const bookingId = (data as { id: string }).id;
    console.log("[send-booking] Supabase'e kaydedildi, ID:", bookingId);

    // Admin panelini senkronize et (Tüm diller için global)
    revalidatePath("/", "layout");

    /* ── Adım 3: Resend ile e-posta gönder (opsiyonel) ── */
    const toEmail = process.env.BOOKING_TO_EMAIL;
    const apiKey  = process.env.RESEND_API_KEY;

    if (apiKey && toEmail) {
      const { error: mailError } = await resend.emails.send({
        from:    process.env.BOOKING_FROM_EMAIL ?? "Luxe Beauty <onboarding@resend.dev>",
        to:      toEmail,
        replyTo: email,
        subject: isEN
          ? `✨ New Booking: ${name} – ${service} (${date})`
          : `✨ Yeni Rezervasyon: ${name} – ${service} (${date})`,
        html: buildEmailHtml({
          name, phone, email, service, date, time,
          note: note ?? "", isEN, bookingId,
        }),
      });

      if (mailError) {
        // E-posta başarısız olsa bile rezervasyon Supabase'de kaydedildi
        console.warn("[send-booking] E-posta gönderilemedi:", mailError.message);
      } else {
        console.log("[send-booking] E-posta gönderildi →", toEmail);
      }
    } else {
      console.info("[send-booking] RESEND_API_KEY veya BOOKING_TO_EMAIL eksik, e-posta atlanıyor.");
    }

    return NextResponse.json({ ok: true, bookingId });

  } catch (err) {
    console.error("[send-booking] Beklenmeyen hata:", err);
    return NextResponse.json(
      { ok: false, error: "Sunucu hatası, lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

/* ── Branded HTML e-posta şablonu ── */
interface EmailParams {
  name: string; phone: string; email: string;
  service: string; date: string; time: string;
  note: string; isEN: boolean; bookingId: string;
}

function buildEmailHtml(p: EmailParams): string {
  const { name, phone, email, service, date, time, note, isEN, bookingId } = p;
  const shortId = bookingId.replace(/-/g, "").slice(0, 8).toUpperCase();

  const rows = [
    [isEN ? "Client Name"  : "Ad Soyad",  name],
    [isEN ? "Phone"        : "Telefon",   phone],
    [isEN ? "E-mail"       : "E-posta",   email],
    [isEN ? "Treatment"    : "Hizmet",    service],
    [isEN ? "Date"         : "Tarih",     date],
    [isEN ? "Time"         : "Saat",      time],
    ...(note ? [[isEN ? "Note" : "Not",   note]] : []),
    ["Booking #",                          shortId],
  ];

  const tableRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f0e0;">
          <p style="margin:0;font-size:10px;color:#aaa;letter-spacing:0.12em;text-transform:uppercase;">${label}</p>
          <p style="margin:5px 0 0;font-size:15px;color:#333;font-weight:600;">${value}</p>
        </td>
      </tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="${isEN ? "en" : "tr"}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#fffdd0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffdd0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr><td style="background:#1a1a1a;padding:30px 36px;text-align:center;">
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">
            ${isEN ? "New Reservation Request" : "Yeni Rezervasyon Talebi"}
          </p>
          <h1 style="margin:0;color:#d4af37;font-size:28px;font-weight:300;letter-spacing:0.06em;">
            Luxe <strong style="font-weight:700;">Beauty</strong>
          </h1>
        </td></tr>

        <!-- Gold gradient bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#d4af37,#f0d57a,#d4af37);"></td></tr>

        <!-- Body -->
        <tr><td style="padding:36px;">
          <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">
            ${isEN
              ? "A new booking request has been received. Please contact the client to confirm."
              : "Yeni bir rezervasyon talebi alındı. Lütfen müşteri ile iletişime geçerek onaylayın."}
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">${tableRows}</table>

          <div style="margin-top:28px;padding:16px 20px;background:#fffdf0;border-radius:10px;border-left:4px solid #d4af37;">
            <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
              ${isEN
                ? "💡 Tip: You can reply directly to this email to reach the client."
                : "💡 İpucu: Bu e-postaya doğrudan yanıt vererek müşteriye ulaşabilirsiniz."}
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid #f0e8c8;text-align:center;">
          <p style="margin:0;font-size:12px;color:#ccc;">© 2026 Luxe Beauty &nbsp;·&nbsp; luxebeauty.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
