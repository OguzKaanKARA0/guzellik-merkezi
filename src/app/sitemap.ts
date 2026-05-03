import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = 'https://luxebeauty.com';
  const services = ["hair", "skin", "makeup", "nails", "brows", "permanent"];
  
  const mainPages = routing.locales.map((locale) => ({
    url: `${url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
  }));

  const servicePages = routing.locales.flatMap((locale) => 
    services.map((slug) => ({
      url: `${url}/${locale}/hizmetler/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  return [...mainPages, ...servicePages];
}
