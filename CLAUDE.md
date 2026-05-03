# Luxe Beauty Development Standards

## Commands
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run lint`: Run ESLint checks

## Tech Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth)
- Resend (Email Notifications)
- Lucide React (Icons)
- next-intl (i18n)

## Code Standards
- Use **TypeScript** for all new files.
- Favor **Server Components** for data fetching.
- Use **Server Actions** for form submissions and mutations.
- Maintain a **clean separation** between business logic (actions) and UI (components).
- All UI components should be **responsive** and follow the luxury theme.

## Current Priorities
- Ensuring data sync between Lead capture and Admin Dashboard.
- Maintaining high SEO scores via dynamic metadata and JSON-LD.
- Protecting admin routes with proper middleware authentication.
