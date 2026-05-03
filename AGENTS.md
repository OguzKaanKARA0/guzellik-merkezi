# 🤖 AI Agents Collaboration Guide

This document defines the rules and best practices for AI agents (Antigravity, Claude, etc.) working on the **Luxe Beauty** codebase.

## 🎨 Design Philosophy
1.  **Luxury First:** Every UI change must adhere to the "Premium & Luxury" aesthetic. Use `--color-gold`, `--color-cream`, and serif fonts (`--font-serif`).
2.  **No Placeholders:** Never use placeholder images. Generate real assets using available tools.
3.  **Micro-animations:** Always implement subtle hover effects, transitions, and fade-ins for a "live" feel.

## 🛠 Technical Rules
1.  **Server Actions:** All database mutations must happen in Server Actions (`src/app/actions/*` or `src/app/[locale]/admin/actions.ts`).
2.  **Security:** Use `supabaseAdmin` (Service Role) only for administrative tasks in Server Actions. Never expose it to the client.
3.  **SEO:** Every new page must implement `generateMetadata` and follow the established heading hierarchy.
4.  **Internationalization:** Use `next-intl` for all user-facing strings. Never hardcode text in components.

## 📂 Project Structure
-   `src/app/[locale]`: Multilingual routing and pages.
-   `src/components`: Reusable UI components.
-   `src/messages`: Translation JSON files.
-   `src/utils/supabase`: Database client configurations.

## 🔄 Workflow
-   Before making a change, check `CLAUDE.md` for specific technical debt or ongoing tasks.
-   Always run `revalidatePath` after data modifications to keep the UI in sync.
-   Document significant architectural changes in `AGENTS.md`.
