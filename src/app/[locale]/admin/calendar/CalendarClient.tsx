"use client";

import React, { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Check, X, Clock, Loader2, Phone, Scissors, CircleCheck, Trash2 } from "lucide-react";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateBookingStatus, createManualBooking, deleteBooking } from "@/app/[locale]/admin/actions";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

/* ─────────────────────────────────────────────── */
/*  Constants                                       */
/* ─────────────────────────────────────────────── */
const dayNamesTr = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);
const SERVICES = ["Saç Tasarımı", "Premium Cilt Bakımı", "Kişiye Özel Makyaj", "Manikür & Pedikür", "Kaş Tasarımı", "Kalıcı Makyaj"];

/* ─────────────────────────────────────────────── */
/*  Types                                           */
/* ─────────────────────────────────────────────── */
type Booking = {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM
  status: "pending" | "approved" | "confirmed" | "cancelled" | "completed" | string;
  note: string;
};

type Props = {
  bookings: Booking[];
  visitMap: Record<string, number>;
  weekOffset: number;
  mondayIso: string; // YYYY-MM-DD
  locale: string;
};

/* ─────────────────────────────────────────────── */
/*  Helpers                                         */
/* ─────────────────────────────────────────────── */
// Local YYYY-MM-DD arithmetic — toISOString() returns UTC and can shift dates
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function todayLocal(): string {
  const now = new Date();
  const yy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function shortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function normalizeTime(t: string): string {
  return t ? t.slice(0, 5) : "";
}

/* ─────────────────────────────────────────────── */
/*  Status helpers                                  */
/* ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === "approved" || status === "confirmed")
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, background: "#dcfce7", color: "#166534", fontSize: "0.72rem", fontWeight: 700 }}><Check size={11} />Onaylı</span>;
  if (status === "completed")
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, background: "#f3e8ff", color: "#6b21a8", fontSize: "0.72rem", fontWeight: 700 }}><Check size={11} />Tamamlandı</span>;
  if (status === "cancelled")
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, background: "#fee2e2", color: "#b91c1c", fontSize: "0.72rem", fontWeight: 700 }}><X size={11} />İptal</span>;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, background: "#fef9c3", color: "#854d0e", fontSize: "0.72rem", fontWeight: 700 }}><Clock size={11} />Bekliyor</span>;
}

/* ─────────────────────────────────────────────── */
/*  New Booking Dialog                              */
/* ─────────────────────────────────────────────── */
function NewBookingDialog({
  open, onClose, date, time, onSave
}: {
  open: boolean; onClose: () => void; date: string; time: string; onSave: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: SERVICES[0],
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setLoading(true);
    const res = await createManualBooking({
      name: formData.name,
      phone: formData.phone,
      service: formData.service,
      note: formData.note,
      email: undefined,
      date,
      time
    });
    setLoading(false);

    if (res.success) {
      toast.success("Randevu eklendi", {
        description: "Yeni randevu başarıyla kaydedildi.",
      });
      await onSave();
      onClose();
    } else {
      toast.error("Hata oluştu", {
        description: res.error,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]" style={{ fontFamily: "var(--font-sans)" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400, color: "var(--color-primary)" }}>
            Yeni <span style={{ color: "var(--color-gold)" }}>Randevu Ekle</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-xs font-bold uppercase tracking-wider text-charcoal-muted">İsim</Label>
            <Input id="name" required className="col-span-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right text-xs font-bold uppercase tracking-wider text-charcoal-muted">Telefon</Label>
            <Input id="phone" required type="tel" className="col-span-3" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service" className="text-right text-xs font-bold uppercase tracking-wider text-charcoal-muted">Hizmet</Label>
            <div className="col-span-3">
              <Select value={formData.service} onValueChange={v => setFormData({...formData, service: v ?? SERVICES[0]})}>
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-xs font-bold uppercase tracking-wider text-charcoal-muted">Zaman</Label>
            <div className="col-span-3 text-sm font-medium text-primary">
              {shortDate(date)} · {time}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right text-xs font-bold uppercase tracking-wider text-charcoal-muted">Not</Label>
            <Textarea id="note" className="col-span-3 h-20" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
          </div>

          <DialogFooter className="mt-4" showCloseButton={false}>
            <DialogClose
              render={
                <button
                  type="button"
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              }
            >
              Vazgeç
            </DialogClose>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: 8,
                background: loading ? "#d4a96e" : "#C9A96E",
                color: "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading && <Loader2 size={15} style={{ animation: "cal-spin 1s linear infinite" }} />}
              Kaydet
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────── */
/*  Booking Detail Sheet                            */
/* ─────────────────────────────────────────────── */
function BookingSheet({
  booking, visitCount, onClose, onRefetch,
}: {
  booking: Booking | null;
  visitCount: number;
  onClose: () => void;
  onRefetch: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(booking?.status ?? "");

  const bookingId = booking?.id;
  React.useEffect(() => {
    if (booking) setLocalStatus(booking.status);
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStatus = localStatus || booking?.status || "";

  const handleStatus = async (newStatus: "approved" | "confirmed" | "cancelled" | "completed") => {
    if (!booking) return;
    setIsLoading(true);
    const res = await updateBookingStatus(booking.id, newStatus);
    if (res.success) {
      const labels: Record<string, string> = { approved: "Randevu onaylandı", confirmed: "Randevu onaylandı", cancelled: "Randevu iptal edildi", completed: "Randevu tamamlandı" };
      toast.success(labels[newStatus] ?? "Güncellendi");
      await onRefetch();
      onClose();
    } else {
      toast.error("İşlem başarısız", { description: "Tekrar deneyin." });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!booking) return;
    setIsLoading(true);
    const res = await deleteBooking(booking.id);
    if (res.success) {
      toast.success("Randevu silindi");
      await onRefetch();
      onClose();
    } else {
      toast.error("Silinemedi", { description: res.error });
    }
    setIsLoading(false);
  };

  return (
    <Sheet open={!!booking} onOpenChange={(v: boolean) => { if (!v) onClose(); }}>
      <SheetContent side="right" style={{ width: "100%", maxWidth: 420, padding: "1.75rem", overflowY: "auto" }}>
        {booking && (
          <>
            <SheetHeader style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,169,110,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "#C9A96E", flexShrink: 0 }}>
                  {booking.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <SheetTitle style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 400, color: "var(--color-primary, #2C1810)", margin: 0 }}>
                    {booking.name}
                  </SheetTitle>
                  <StatusBadge status={currentStatus} />
                </div>
              </div>
            </SheetHeader>

            {/* Info rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <InfoRow icon={<Phone size={15} />} label="Telefon" value={booking.phone} />
              <InfoRow icon={<Scissors size={15} />} label="Hizmet" value={booking.service} />
              <InfoRow icon={<CalendarDays size={15} />} label="Tarih / Saat" value={`${shortDate(booking.date)} · ${normalizeTime(booking.time)}`} />
              <InfoRow icon={<Check size={15} />} label="Toplam Ziyaret" value={`${visitCount} randevu`} />
              {booking.note && (
                <div style={{ background: "#fafafa", borderRadius: 10, padding: "0.75rem 1rem", borderLeft: "3px solid #C9A96E" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Not</span>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#555" }}>{booking.note}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <SheetFooter style={{ flexDirection: "column", gap: "0.6rem", padding: 0 }}>
              {currentStatus !== "confirmed" && currentStatus !== "approved" && (
                <button onClick={() => handleStatus("confirmed")} disabled={isLoading}
                  style={{ width: "100%", padding: "0.85rem", borderRadius: 10, background: "#C9A96E", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {isLoading ? <Loader2 size={16} style={{ animation: "cal-spin 1s linear infinite" }} /> : <Check size={16} />}
                  Onayla
                </button>
              )}
              {currentStatus !== "completed" && (
                <button onClick={() => handleStatus("completed")} disabled={isLoading}
                  style={{ width: "100%", padding: "0.85rem", borderRadius: 10, background: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff", fontWeight: 700, fontSize: "0.875rem", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CircleCheck size={16} /> Tamamlandı
                </button>
              )}
              {currentStatus !== "cancelled" && (
                <button onClick={() => handleStatus("cancelled")} disabled={isLoading}
                  style={{ width: "100%", padding: "0.85rem", borderRadius: 10, background: "transparent", color: "#b91c1c", border: "1px solid #fecaca", fontWeight: 700, fontSize: "0.875rem", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <X size={16} /> İptal Et
                </button>
              )}
              <button onClick={handleDelete} disabled={isLoading}
                style={{ width: "100%", padding: "0.85rem", borderRadius: 10, background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.875rem", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "0.25rem" }}>
                {isLoading ? <Loader2 size={16} style={{ animation: "cal-spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                Randevuyu Sil
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,169,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#C9A96E" }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", display: "block" }}>{label}</span>
        <span style={{ fontSize: "0.9rem", color: "var(--color-primary, #2C1810)", fontWeight: 500 }}>{value}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Main Calendar Client                            */
/* ─────────────────────────────────────────────── */
export function CalendarClient({ bookings, visitMap, weekOffset, mondayIso, locale }: Props) {
  const router = useRouter();
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; time: string } | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal());
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [monthSelectedDay, setMonthSelectedDay] = useState<string | null>(null);

  const monthCells = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const firstDay = new Date(y, m - 1, 1);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0, Sun=6
    const daysInMonth = new Date(y, m, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < 42; i++) {
      if (i < startOffset || i >= startOffset + daysInMonth) {
        cells.push(null);
      } else {
        const day = i - startOffset + 1;
        const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push(dateStr);
      }
    }
    return cells;
  }, [monthOffset]);

  function getMonthLabel(offset: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  }

  function formatLongDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayTr = dayNamesTr[dateObj.getDay()];
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    return `${d} ${months[m - 1]} ${y}, ${dayTr}`;
  }

  // Build lookup: "YYYY-MM-DD|HH:MM" → Booking[]
  const slotMap: Record<string, Booking[]> = {};
  for (const b of localBookings) {
    const key = `${b.date}|${normalizeTime(b.time)}`;
    slotMap[key] = slotMap[key] ? [...slotMap[key], b] : [b];
  }

  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const baseDate = useMemo(() => {
    return addDays(todayLocal(), weekOffset * 7);
  }, [weekOffset]);

  const dynamicDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const dateStr = addDays(baseDate, i);
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return {
        dateStr,
        dayName: dayNamesTr[dateObj.getDay()]
      };
    });
  }, [baseDate]);

  const weekRangeLabel = useMemo(() => {
    if (!dynamicDays || dynamicDays.length === 0) return "";
    const firstStr = dynamicDays[0].dateStr;
    const lastStr = dynamicDays[dynamicDays.length - 1].dateStr;
    const [y1, m1, d1] = firstStr.split("-").map(Number);
    const [y2, m2, d2] = lastStr.split("-").map(Number);
    const dObj1 = new Date(y1, m1 - 1, d1);
    const dObj2 = new Date(y2, m2 - 1, d2);
    const mStr1 = dObj1.toLocaleDateString("tr-TR", { month: "long" });
    const mStr2 = dObj2.toLocaleDateString("tr-TR", { month: "long" });
    if (m1 === m2) {
      return `${d1} - ${d2} ${mStr1} ${y1}`;
    }
    if (y1 === y2) {
      return `${d1} ${mStr1} - ${d2} ${mStr2} ${y1}`;
    }
    return `${d1} ${mStr1} ${y1} - ${d2} ${mStr2} ${y2}`;
  }, [dynamicDays]);

  const fetchBookings = useCallback(async () => {
    const supabase = createClient();
    let startD, endD;

    if (viewMode === "month") {
      const d = new Date();
      d.setMonth(d.getMonth() + monthOffset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      startD = `${y}-${m}-01`;
      endD = `${y}-${m}-31`;
    } else {
      const [y, m] = baseDate.split("-").map(Number);
      startD = `${y}-${String(m).padStart(2, "0")}-01`;
      endD = `${y}-${String(m).padStart(2, "0")}-31`;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("id, name, phone, service, date, time, status, note")
      .gte("date", startD)
      .lte("date", endD)
      .order("time", { ascending: true });
      
    if (error) {
      console.error("Supabase fetch error:", error);
    }
    if (data) {
      setLocalBookings(data as Booking[]);
    }
  }, [baseDate, viewMode, monthOffset]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Realtime subscription: Müşteri siteden randevu aldığında veya admin sildiğinde anında güncelle
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        },
        () => {
          console.log("[Realtime] Randevu tablosunda değişiklik algılandı, veriler yenileniyor...");
          fetchBookings();
        }
      )
      .on('system', { event: '*' }, (payload) => {
        console.log('[Realtime] System status:', payload);
      })
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const navigate = (offset: number) => {
    router.push(`/${locale}/admin/calendar?week=${weekOffset + offset}`);
  };

  const goToday = () => router.push(`/${locale}/admin/calendar?week=0`);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <style>{`
        @keyframes cal-spin { to { transform: rotate(360deg); } }
        .cal-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .cal-grid {
          display: grid;
          grid-template-columns: 60px repeat(6, minmax(130px, 1fr));
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(201, 169, 110, 0.2);
          box-shadow: 0 10px 40px rgba(44, 24, 16, 0.05);
          background: #FAF7F2;
          min-width: 860px;
          font-family: var(--font-sans);
        }
        .cal-header-cell {
          background: #2C1810;
          color: #FAF7F2;
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-right: 1px solid rgba(250, 247, 242, 0.08);
          font-family: var(--font-serif);
        }
        .cal-header-cell:last-child { border-right: none; }
        .cal-time-cell {
          background: #FAF7F2;
          border-right: 1px solid rgba(44, 24, 16, 0.06);
          border-bottom: 1px solid rgba(44, 24, 16, 0.06);
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #2C1810;
          opacity: 0.7;
          letter-spacing: 0.05em;
          height: 48px;
          font-family: var(--font-sans);
        }
        .cal-slot {
          border-right: 1px solid rgba(44, 24, 16, 0.05);
          border-bottom: 1px solid rgba(44, 24, 16, 0.05);
          height: 48px;
          padding: 0.25rem;
          position: relative;
          transition: background 0.15s;
          background: #FAF7F2;
        }
        .cal-slot:last-child { border-right: none; }
        .cal-slot-empty {
          cursor: pointer;
          background: transparent;
        }
        .cal-slot-empty:hover { background: rgba(201, 169, 110, 0.08); }
        .cal-slot-empty:hover::after {
          content: '+';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.1rem;
          color: #C9A96E;
          opacity: 0.6;
        }
        .cal-booking-pill {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background: linear-gradient(135deg, #C9A96E, #A3834D);
          color: #FAF7F2;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          transition: filter 0.15s, transform 0.15s;
          border: none;
          text-align: left;
          font-family: var(--font-sans);
          box-shadow: 0 4px 10px rgba(201, 169, 110, 0.25);
        }
        .cal-booking-pill:hover { filter: brightness(1.08); transform: scale(1.02); }
        .cal-pill-name { font-size: 0.75rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cal-pill-service { font-size: 0.62rem; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cal-pill-cancelled { background: linear-gradient(135deg, #f87171, #b91c1c) !important; }
        .cal-pill-approved { background: linear-gradient(135deg, #4ade80, #16a34a) !important; }
        .cal-nav { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .cal-nav-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 0.6rem 1.1rem; border-radius: 10px;
          border: 1px solid rgba(212,175,55,0.35);
          background: #fff; cursor: pointer; font-size: 0.82rem; font-weight: 600;
          color: var(--color-primary, #2C1810);
          transition: background 0.15s;
          font-family: var(--font-sans);
        }
        .cal-nav-btn:hover { background: rgba(212,175,55,0.08); }
        .cal-nav-btn-today {
          background: #2C1810; color: #FAF7F2; border-color: #2C1810;
        }
        .cal-nav-btn-today:hover { background: #C9A96E; border-color: #C9A96E; }
        .cal-legend { display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .cal-legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #888; font-family: var(--font-sans); }
        .cal-legend-dot { width: 10px; height: 10px; border-radius: 3px; }

        .cal-view-toggle { display: flex; gap: 0.5rem; margin-right: auto; }
        .cal-view-btn { padding: 0.6rem 1.1rem; border-radius: 10px; border: 1px solid rgba(212,175,55,0.35); background: #fff; cursor: pointer; font-size: 0.82rem; font-weight: 600; color: var(--color-primary, #2C1810); transition: all 0.15s; font-family: var(--font-sans); }
        .cal-view-btn.active { background: #C9A96E; color: #fff; border-color: #C9A96E; }

        .cal-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #eee; border: 1px solid rgba(212,175,55,0.15); border-radius: 14px; overflow: hidden; margin-bottom: 2rem; }
        .cal-month-cell { background: #fff; min-height: 80px; padding: 0.5rem; cursor: pointer; transition: background 0.15s; }
        .cal-month-cell:hover { background: #fafafa; }
        .cal-month-cell-empty { background: #f9f9f9; cursor: default; }
        .cal-month-header { background: #2C1810; color: #FAF7F2; padding: 0.75rem 0; text-align: center; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .cal-month-day { font-size: 0.9rem; font-weight: 600; color: #555; margin-bottom: 0.5rem; display: block; }
        .cal-month-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A96E; display: inline-block; margin-right: 3px; }

        .cal-day-view { background: #fff; border: 1px solid rgba(212,175,55,0.15); border-radius: 14px; padding: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.04); margin-bottom: 2rem; }
        .cal-day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; flex-wrap: wrap; gap: 1rem; }
        .cal-day-title { font-family: var(--font-serif); font-size: 1.5rem; color: #2C1810; margin: 0; }
        .add-btn { background: #C9A96E; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-size: 0.85rem; }
        .add-btn:hover { background: #A3834D; }
        .cal-day-timeline { display: flex; flex-direction: column; }
        .cal-day-row { display: flex; border-bottom: 1px solid #f5f5f5; min-height: 48px; }
        .cal-day-hour { width: 60px; padding: 0.5rem 0; font-size: 0.75rem; font-weight: 600; color: #aaa; text-align: right; padding-right: 1rem; border-right: 1px solid #eee; }
        .cal-day-slots { flex: 1; padding: 0.25rem 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; cursor: pointer; transition: background 0.15s; }
        .cal-day-slots:hover { background: rgba(201,169,110,0.03); }
        .cal-day-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
        .cal-day-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-color: #C9A96E; }
        .cal-card-name { font-family: var(--font-serif); font-size: 0.85rem; color: #2C1810; margin-bottom: 0.1rem; font-weight: 600; }
        .cal-card-service { font-size: 0.7rem; color: #888; font-weight: 500; }
        .cal-status-dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-pending { background: #facc15; }
        .dot-approved, .dot-confirmed { background: #4ade80; }
        .dot-cancelled { background: #f87171; }
        .dot-completed { background: #c084fc; }
      `}</style>

      {/* Navigation */}
      <div className="cal-nav">
        <div className="cal-view-toggle">
          <button className={`cal-view-btn ${viewMode === "day" ? "active" : ""}`} onClick={() => setViewMode("day")}>Gün</button>
          <button className={`cal-view-btn ${viewMode === "week" ? "active" : ""}`} onClick={() => setViewMode("week")}>Hafta</button>
          <button className={`cal-view-btn ${viewMode === "month" ? "active" : ""}`} onClick={() => setViewMode("month")}>Ay</button>
        </div>
        
        {viewMode === "week" && (
          <>
            <span style={{ margin: "0 auto", fontSize: "1.05rem", fontWeight: 700, color: "#2C1810", fontFamily: "var(--font-serif)" }}>
              {weekRangeLabel}
            </span>
            <button className="cal-nav-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={16} /> Önceki
            </button>
            <button className="cal-nav-btn cal-nav-btn-today" onClick={goToday}>
              <CalendarDays size={15} /> Bu Hafta
            </button>
            <button className="cal-nav-btn" onClick={() => navigate(1)}>
              Sonraki <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {viewMode === "week" && (
        <>
          <div className="cal-legend">
            <div className="cal-legend-item">
              <div className="cal-legend-dot" style={{ background: "linear-gradient(135deg, #C9A96E, #A3834D)" }} /> Bekliyor
            </div>
            <div className="cal-legend-item">
              <div className="cal-legend-dot" style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }} /> Onaylı
            </div>
            <div className="cal-legend-item">
              <div className="cal-legend-dot" style={{ background: "linear-gradient(135deg, #f87171, #b91c1c)" }} /> İptal
            </div>
            <div className="cal-legend-item">
              <div className="cal-legend-dot" style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }} /> Boş Slot
            </div>
          </div>
          <div className="cal-wrap">
            <div className="cal-grid">
              {/* Header row */}
              <div className="cal-header-cell" style={{ background: "#1a0f0a" }}></div>
              {dynamicDays.map(({ dateStr, dayName }) => {
                const isToday = dateStr === todayLocal();
                return (
                  <div key={dateStr} className="cal-header-cell" style={isToday ? { background: "#C9A96E" } : {}}>
                    <div>{dayName}</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 400, opacity: 0.75, marginTop: 2 }}>{shortDate(dateStr)}</div>
                  </div>
                );
              })}

              {/* Time rows */}
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="cal-time-cell">{hour}</div>
                  {dynamicDays.map(({ dateStr }) => {
                    const key = `${dateStr}|${hour}`;
                    const slotBookings = slotMap[key] ?? [];

                    return (
                      <div
                        key={key}
                        className={`cal-slot ${slotBookings.length === 0 ? "cal-slot-empty" : ""}`}
                        onClick={slotBookings.length === 0 ? () => setNewSlot({ date: dateStr, time: hour }) : undefined}
                      >
                        {slotBookings.map((b) => (
                          <button
                            key={b.id}
                            className={`cal-booking-pill ${b.status === "cancelled" ? "cal-pill-cancelled" : (b.status === "approved" || b.status === "confirmed" || b.status === "completed") ? "cal-pill-approved" : ""}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                            title={`${b.name} · ${b.service}`}
                          >
                            <span className="cal-pill-name">{b.name}</span>
                            <span className="cal-pill-service">{b.service}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === "day" && (
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          <div style={{ width: "35%", display: "flex", flexDirection: "column", gap: "1rem" }}>
             <div style={{ background: "#fff", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "#2C1810", margin: "0 0 1rem 0" }}>Takvim</h3>
                <div className="cal-month-grid" style={{ marginBottom: 0, border: "none", borderRadius: 0, gap: "4px", background: "transparent" }}>
                  {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(h => (
                    <div key={h} className="cal-month-header" style={{ padding: "0.25rem 0", fontSize: "0.6rem", background: "transparent", color: "#888" }}>{h}</div>
                  ))}
                  {monthCells.map((dateStr, idx) => {
                    if (!dateStr) return <div key={`mini-empty-${idx}`} className="cal-month-cell-empty" style={{ minHeight: "36px", background: "transparent" }} />;
                    const isToday = dateStr === todayLocal();
                    const isSelected = dateStr === selectedDate;
                    return (
                      <div key={dateStr} className="cal-month-cell" style={{ minHeight: "36px", padding: "0.25rem", textAlign: "center", borderRadius: "6px", background: isSelected ? "#C9A96E" : isToday ? "rgba(201,169,110,0.15)" : "#fdfdfd", color: isSelected ? "#fff" : "#555", border: isToday && !isSelected ? "1px solid #C9A96E" : "1px solid #eee" }} onClick={() => setSelectedDate(dateStr)}>
                        <span style={{ fontSize: "0.8rem", fontWeight: isSelected || isToday ? 800 : 500 }}>
                          {parseInt(dateStr.split("-")[2], 10)}
                        </span>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
          <div style={{ width: "65%" }}>
            <div className="cal-day-view" style={{ margin: 0 }}>
              <div className="cal-day-header">
                <h2 className="cal-day-title">{formatLongDate(selectedDate)}</h2>
                <button className="add-btn" onClick={() => setNewSlot({ date: selectedDate, time: "09:00" })}>+ Yeni Randevu</button>
              </div>
              <div className="cal-day-timeline">
                {HOURS.map(hour => {
                  const hourPrefix = hour.slice(0, 2);
                  const hourBookings = localBookings.filter(b => b.date === selectedDate && b.time.startsWith(hourPrefix)).sort((a,b) => a.time.localeCompare(b.time));
                  return (
                    <div key={hour} className="cal-day-row">
                      <div className="cal-day-hour">{hour}</div>
                      <div className="cal-day-slots" onClick={(e) => {
                        if (e.target === e.currentTarget) setNewSlot({ date: selectedDate, time: hour });
                      }}>
                        {hourBookings.map(b => (
                          <div key={b.id} className="cal-day-card" onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>
                            <div className={`cal-status-dot dot-${b.status === "approved" || b.status === "confirmed" ? "approved" : b.status}`}></div>
                            <div style={{ flex: 1 }}>
                              <div className="cal-card-name">{b.name}</div>
                              <div className="cal-card-service">{b.service}</div>
                            </div>
                            <div><StatusBadge status={b.status} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#2C1810", margin: 0, textTransform: "capitalize" }}>
              {getMonthLabel(monthOffset)}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="cal-nav-btn" onClick={() => setMonthOffset(m => m - 1)}><ChevronLeft size={16} /> Önceki Ay</button>
              <button className="cal-nav-btn cal-nav-btn-today" onClick={() => setMonthOffset(0)}><CalendarDays size={15} /> Bu Ay</button>
              <button className="cal-nav-btn" onClick={() => setMonthOffset(m => m + 1)}>Sonraki Ay <ChevronRight size={16} /></button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
            <div className="cal-month-grid" style={{ flex: 1, margin: 0 }}>
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(h => (
                <div key={h} className="cal-month-header">{h}</div>
              ))}
              {monthCells.map((dateStr, idx) => {
                if (!dateStr) return <div key={`empty-${idx}`} className="cal-month-cell cal-month-cell-empty" />;
                const dayBookings = localBookings.filter(b => b.date === dateStr);
                const isToday = dateStr === todayLocal();
                const isSelected = dateStr === monthSelectedDay;
                return (
                  <div key={dateStr} className="cal-month-cell" style={isSelected ? { background: "rgba(201,169,110,0.08)" } : {}} onClick={() => { setMonthSelectedDay(prev => prev === dateStr ? null : dateStr); }}>
                    <span className="cal-month-day" style={isToday ? { color: "#C9A96E", fontWeight: 800 } : {}}>
                      {parseInt(dateStr.split("-")[2], 10)}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                      {dayBookings.map(b => (
                        <div key={b.id} className="cal-month-dot" title={`${b.name} - ${b.service}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {monthSelectedDay && (
              <div style={{ width: "320px", background: "#fff", borderRadius: "14px", border: "1px solid rgba(212,175,55,0.15)", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2C1810", margin: 0, fontFamily: "var(--font-serif)" }}>{formatLongDate(monthSelectedDay)}</h3>
                  <button onClick={() => setMonthSelectedDay(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}><X size={16} /></button>
                </div>
                <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                   {localBookings.filter(b => b.date === monthSelectedDay).sort((a,b) => a.time.localeCompare(b.time)).map(b => (
                     <div key={b.id} className="cal-day-card" style={{ padding: "0.75rem", border: "1px solid #eee", background: "#fafafa" }} onClick={() => setSelectedBooking(b)}>
                       <div className={`cal-status-dot dot-${b.status === "approved" || b.status === "confirmed" ? "approved" : b.status}`}></div>
                       <div style={{ flex: 1 }}>
                         <div className="cal-card-name" style={{ fontSize: "0.9rem" }}>{b.name}</div>
                         <div className="cal-card-service">{b.time} · {b.service}</div>
                       </div>
                     </div>
                   ))}
                   {localBookings.filter(b => b.date === monthSelectedDay).length === 0 && (
                     <div style={{ fontSize: "0.85rem", color: "#888", textAlign: "center", padding: "1rem 0" }}>Bu tarihte randevu yok.</div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking detail sheet */}
      <BookingSheet
        booking={selectedBooking}
        visitCount={selectedBooking ? (visitMap[selectedBooking.phone] ?? 1) : 0}
        onClose={() => setSelectedBooking(null)}
        onRefetch={fetchBookings}
      />

      {/* New booking dialog */}
      {newSlot && (
        <NewBookingDialog
          open={!!newSlot}
          onClose={() => setNewSlot(null)}
          date={newSlot.date}
          time={newSlot.time}
          onSave={async () => { await fetchBookings(); }}
        />
      )}
    </div>
  );
}
