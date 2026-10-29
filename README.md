# ZombieCRM

> A half-built copy of **HubSpot CRM**. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** HubSpot / Pipedrive (paid plans) <!-- Price source: https://www.hubspot.com/pricing/sales checked 2026-10-29. The page shows $7 and $20 per seat for Sales Hub Starter but does not say which one is monthly billing, so no number is given here. -->

**Live demo:** https://zombie-crm.vercel.app (a shared demo: data resets whenever the server restarts)

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3102.

## What works

- Dashboard: open pipeline value, deals won this month, tasks due today, overdue tasks, a bar chart of money in each stage, and recent activity.
- Contacts list, add contact, edit contact, and a company field.
- Notes on each contact.
- Contact page shows that person's deals, tasks and notes together.
- Pipeline board with 5 stages: Lead, Qualified, Proposal, Won, Lost. Move a deal with the dropdown or the arrow buttons.
- Add a deal and link it to a contact. Each deal has its own page with amount, stage, close date and notes.
- Money total for each stage, and a pipeline total at the top of the Pipeline page.
- Tasks: follow-ups with a due date, linked to a contact or a deal. The Tasks page groups them into Overdue, Due today, Upcoming and Done. Tick the box to mark one done.
- Search on the contacts page.
- 9 fake contacts, 10 fake deals and 10 fake tasks come pre-loaded.

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.
