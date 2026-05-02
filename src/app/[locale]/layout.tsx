import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxe Beauty | Profesyonel Güzellik Merkezi",
  description:
    "Luxe Beauty ile güzelliğinizi profesyonel dokunuşlarla keşfedin. Lazer epilasyon, cilt bakımı, kalıcı makyaj ve daha fazlası.",
  openGraph: {
    title: "Luxe Beauty | Profesyonel Güzellik Merkezi",
    description: "Luxe Beauty ile güzelliğinizi profesyonel dokunuşlarla keşfedin. Premium hizmetlerimizi inceleyin.",
    url: "https://luxebeauty.com",
    siteName: "Luxe Beauty",
    images: [
      {
        url: "https://luxebeauty.com/gallery/before-after-after.jpg",
        width: 1200,
        height: 630,
        alt: "Luxe Beauty Salon",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Beauty | Profesyonel Güzellik Merkezi",
    description: "Luxe Beauty ile güzelliğinizi profesyonel dokunuşlarla keşfedin.",
    images: ["https://luxebeauty.com/gallery/before-after-after.jpg"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
