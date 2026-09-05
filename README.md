# Roséa Beauty Center

**Live site:** [rosea-beauty.netlify.app](https://rosea-beauty.netlify.app)

Marketing site and online booking experience for **Roséa**, a beauty salon in Istanbul. Guests can browse services, meet the team, view the gallery, read the blog, and reserve a slot with secure checkout.

The public site is a Vite + React SPA. Content and appointments live in Supabase. Payments go through Stripe Checkout — card details never touch this app.

## Features

- Multi-step booking: service → specialist → date & time → guest details
- Overlap-safe appointments and specialist availability
- Stripe Checkout (hosted payment page, TRY)
- Services, gallery, team, blog, testimonials, and contact content from the database
- Turkish UI, Playfair Display + Poppins, blush / cream / ink palette
- Route-level code splitting and a first-load splash

## Tech stack

| Layer | Choice |
| --- | --- |
| App | React 19, React Router, Vite 8 |
| Styling | Tailwind CSS 4 |
| Data | Supabase (Postgres, Auth, Edge Functions, Storage) |
| Payments | Stripe Checkout |
| Forms | React Hook Form |

## Getting started

**Requirements:** Node.js 20+, a [Supabase](https://supabase.com) project, and a [Stripe](https://stripe.com) account (test mode is fine).

```bash
git clone <your-repo-url>
cd beauty
npm install
cp .env.example .env
```

Fill `.env` with the **project URL** and **anon (publishable) key** from Supabase → Project Settings → API. Never put the service role key or Stripe secrets in this file.

```bash
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Public anon key |
| `STRIPE_SECRET_KEY` | Edge Function secrets | Server-side Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Edge Function secrets | Webhook signature check |
| `SITE_URL` | Edge Function secrets | Fallback return URL after payment. Use the live site in production. |

Stripe keys stay in Supabase secrets only:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set SITE_URL=https://rosea-beauty.netlify.app
```

## Database

SQL migrations live in [`supabase/migrations`](supabase/migrations). Run them in order in the Supabase SQL Editor (or `supabase db push` if you use the CLI).

Typical sequence:

1. `0001_init_schema.sql` — content tables and seed
2. `0002_home_about_extras.sql` — home about extras
3. `0003_booking_schema.sql` — specialists, availability, appointments
4. Later files — payments, gallery, admin authorization, SEO, and related updates

Do **not** run leftover “remove integration” scripts unless you intend to undo a feature.

## Payments

1. Deploy the Edge Functions:

   ```bash
   npx supabase functions deploy stripe-initialize --no-verify-jwt
   npx supabase functions deploy stripe-webhook --no-verify-jwt
   npx supabase functions deploy stripe-status --no-verify-jwt
   ```

2. In Stripe → Developers → Webhooks, add:

   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`

   Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.

3. Save the signing secret:

   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

Test card: `4242 4242 4242 4242` — any future expiry — CVC `123`.

The charged amount always comes from `services.price_amount` in the database, not from the browser.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # ESLint
```

## Project layout

```text
src/                    Public React app
  pages/                Routes (home, services, booking, blog, …)
  components/           UI sections and booking wizard
  lib/                  Supabase queries and helpers
supabase/
  migrations/           Postgres schema
  functions/            Stripe and related Edge Functions
```

## Security notes

- `.env` is gitignored. Only `.env.example` is committed.
- Supabase CLI cache (`supabase/.temp`) is gitignored — it can contain project and account identifiers.
- The service role key and Stripe secrets belong in the Supabase dashboard, not in the frontend.

## License

Private project. All rights reserved.
