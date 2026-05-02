"use client";

import { NextIntlClientProvider, Messages } from "next-intl";
import { BookingProvider } from "@/context/BookingContext";
import AppointmentModal from "@/components/AppointmentModal";
import WhatsAppButton from "@/components/WhatsAppButton";

/**
 * Client-side provider tree:
 *  NextIntlClientProvider  (translations)
 *    └─ BookingProvider      (modal open/close state)
 *         └─ AppointmentModal (rendered once, globally)
 *         └─ {children}
 */
export default function Providers({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <BookingProvider>
        <AppointmentModal />
        <WhatsAppButton />
        {children}
      </BookingProvider>
    </NextIntlClientProvider>
  );
}
