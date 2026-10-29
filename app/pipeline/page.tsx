"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STAGES } from "@/lib/types";
import type { Contact, Deal } from "@/lib/types";

type Totals = { perStage: Record<string, number>; pipelineTotal: number };

const money = (n: number) => "$" + n.toLocaleString();

export default function Board() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [contactId, setContactId] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [d, c, t] = await Promise.all([
      fetch("/api/deals").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/totals").then((r) => r.json()),
    ]);
    setDeals(d); setContacts(c); setTotals(t);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setStage(id: string, stage: string) {
    await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    load();
  }

  // Move one column left (-1) or right (+1).
  function move(deal: Deal, step: number) {
    const next = STAGES[STAGES.indexOf(deal.stage) + step];
    if (next) setStage(deal.id, next);
  }

  async function addDeal() {
    if (!title) return setMessage("Give the deal a title.");
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, value, contactId, closeDate }),
    });
    setTitle(""); setValue(""); setCloseDate(""); setMessage("");
    load();
  }

  const contactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? "No contact";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <p className="sub">
            Pipeline total: <strong>{totals ? money(totals.pipelineTotal) : "..."}</strong>
            {/* ZOMBIE: drag and drop is missing. Cards only move with the arrow buttons or the dropdown. */}
            <span className="muted"> (drag and drop is not built yet, use the arrows)</span>
          </p>
        </div>
      </div>

      <div className="card form-row" style={{ marginBottom: 16 }}>
        <input placeholder="Deal title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <select value={contactId} onChange={(e) => setContactId(e.target.value)}>
          <option value="">No contact</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" aria-label="Expected close date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
        <button onClick={addDeal}>Add deal</button>
        {message && <span className="error">{message}</span>}
      </div>

      {deals.length === 0 && <div className="empty" style={{ marginBottom: 16 }}><strong>No deals yet</strong>Add your first deal above.</div>}

      <div className="board">
        {STAGES.map((stage) => (
          <div key={stage} className="column">
            <div className="column-head">
              <strong>{stage}</strong>
              <span className="muted">{totals ? money(totals.perStage[stage]) : ""}</span>
            </div>
            {deals.filter((d) => d.stage === stage).map((d) => (
              <div key={d.id} className="card stack deal">
                <strong><Link href={`/deals/${d.id}`}>{d.title}</Link></strong>
                <span className="muted">{contactName(d.contactId)} · {money(d.value)}</span>
                {d.closeDate && <span className="muted" style={{ fontSize: 12 }}>Close date: {d.closeDate}</span>}
                <select value={d.stage} onChange={(e) => setStage(d.id, e.target.value)}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="row">
                  <button className="ghost" onClick={() => move(d, -1)} disabled={stage === STAGES[0]}>←</button>
                  <button className="ghost" onClick={() => move(d, 1)} disabled={stage === STAGES[STAGES.length - 1]}>→</button>
                  {d.contactId && <Link href={`/contacts/${d.contactId}`}>Contact</Link>}
                </div>
              </div>
            ))}
            {deals.filter((d) => d.stage === stage).length === 0 && <span className="muted" style={{ fontSize: 13 }}>No deals</span>}
          </div>
        ))}
      </div>
    </>
  );
}
