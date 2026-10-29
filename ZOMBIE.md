# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for HubSpot or Pipedrive.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] Drag and drop on the deals board is missing. Cards only move with the dropdown and arrow buttons.
- [ ] The Import CSV button says "Not built yet". Parse the file, check each email, skip duplicates.
- [ ] Search only matches exact case. Searching "maria" does not find "Maria". Fix it in `app/api/contacts/route.ts`.
- [ ] Tasks have no owner. There is no "assigned to" field, so everyone sees everyone's tasks. Add an owner to each task and only show the signed-in user's.
- [ ] Overdue and "due today" use the server's date (UTC on Vercel), not the user's timezone. Look at `lib/tasks.ts`. Compare against the user's local date instead.
- [ ] Tasks cannot be edited (title or date) from the screen, only ticked off. Add an edit form and a repeat option.
- [ ] Deals on the Pipeline page cannot be reordered inside a column, and the dashboard "won this month" depends on the close date being filled in.
- [ ] Lost deals still count in the pipeline total. Fix it in `app/api/totals/route.ts`.

## 2. Make it secure

- [ ] There is no login. Anyone who finds the URL sees everything. Add accounts (Supabase Auth, Clerk, Auth.js...).
- [ ] Every API route trusts whatever it's sent. Validate input on the server.
- [ ] Ids are guessable (`lib/db.ts`). Use random ids and check that the record belongs to the signed-in user.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.
- [ ] Anyone can delete a contact or a deal. There are no roles (owner, admin, member).
- [ ] Anyone can delete or change any task. Tasks have no owner and no roles.
- [ ] Delete has no "are you sure?" and no undo. Add a confirm step and a soft delete with a trash can.
- [ ] Emails are not checked. "not-an-email" is saved as is.

## 3. Make it compliant

- [ ] GDPR (EU) and CCPA/CPRA (California): a contact can ask for a copy of their data and ask to be deleted. There is no export and no "forget me" button.
- [ ] Record why you hold each contact's data and when they agreed to be contacted (consent).
- [ ] CAN-SPAM and CASL: if you add email sending later, you need unsubscribe links and a way to stop emailing someone.
- [ ] No privacy policy or terms page.
- [ ] No way for a user to export or delete their data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan.

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.
