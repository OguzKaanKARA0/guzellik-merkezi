# ✨ Luxe Beauty | Premium SaaS Beauty Management

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](LICENSE)

**Luxe Beauty**, güzellik merkezleri ve klinikler için tasarlanmış, yüksek dönüşüm odaklı ve estetik açıdan kusursuz bir Dikey SaaS (Vertical SaaS) platformudur. Modern web teknolojilerini, lüks bir kullanıcı deneyimi (UX) ve güçlü bir yönetim paneliyle birleştirir.

---

## 💎 Vizyonumuz
Güzellik endüstrisinde dijitalleşmeyi sadece bir gereklilik değil, bir prestij unsuru haline getirmek. Luxe Beauty, müşterilerine premium bir rezervasyon deneyimi sunarken, salon sahiplerine operasyonel mükemmellik sağlar.

## 🚀 Öne Çıkan Özellikler

-   **Premium UI/UX:** Playfair Display ve Inter tipografisiyle harmanlanmış, altın oran esaslı modern tasarım.
-   **Gelişmiş Randevu Sistemi:** Gerçek zamanlı müsaitlik kontrolü ve çakışma önleyici algoritma.
-   **Akıllı Lead Capture:** WhatsApp entegrasyonlu teklif alma modalı ve otomatik veri senkronizasyonu.
-   **Yönetim Paneli (CRM):** Randevuları onaylama, iptal etme ve müşteri taleplerini yönetme yeteneği.
-   **Çok Dillilik (i18n):** Türkçe ve İngilizce dillerinde tam kapsamlı dinamik içerik yönetimi.
-   **SEO & Performans:** Schema.org (BeautySalon) entegrasyonu, dinamik metadata ve %100 mobil uyumluluk.

## 🛠 Teknoloji Yığını

-   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
-   **Database & Auth:** [Supabase](https://supabase.com/)
-   **Styling:** Vanilla CSS & TailwindCSS (Global Tokens)
-   **Email:** [Resend](https://resend.com/)
-   **Icons:** Lucide React
-   **Internationalization:** next-intl

## 📦 Kurulum ve Çalıştırma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/OguzKaanKARA0/guzellik-merkezi.git
cd guzellik-merkezi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevresel Değişkenleri Yapılandırın
`.env.local` dosyasını oluşturun ve aşağıdaki değişkenleri tanımlayın:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
BOOKING_TO_EMAIL=admin@example.com
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

---

## 🛡 Güvenlik ve Mimari
Sistem, hassas operasyonlar (silme, güncelleme) için **Supabase Service Role** anahtarını sunucu tarafında (Server Actions) kullanarak RLS (Row Level Security) katmanını güvenli bir şekilde yönetir. İstemci tarafında sadece anonim erişime izin verilir.

## 📄 Lisans
Bu proje MIT lisansı ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.

---

*Luxe Beauty - Estetik ve Teknolojinin Buluşma Noktası.*
