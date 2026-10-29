# MEL.md

This is a hackathon project: a half-built copy of HubSpot / Pipedrive (a CRM) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data. This is temporary.
- App: contacts (with notes), deals (with notes and a close date), tasks and an activity feed live in `data/db.json`. API routes are in `app/api/contacts`, `app/api/deals`, `app/api/tasks`, `app/api/dashboard` and `app/api/totals`.
- Pages: the dashboard is `app/page.tsx`, the board is `app/pipeline/page.tsx`, tasks are `app/tasks/page.tsx`, one deal is `app/deals/[id]/page.tsx`, one contact is `app/contacts/[id]/page.tsx`.
- `lib/tasks.ts` works out overdue / today / upcoming for a task and adds lines to the activity feed.
- Payments: `app/api/checkout/route.ts` is a stub. Stripe is not connected.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.
