"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { STAGES } from "@/lib/types";
import type { Contact, Deal, Note, TaskWithBucket } from "@/lib/types";

type Full = Deal & { notes: Note[]; contact: Contact | null; tasks: TaskWithBucket[] };

const money = (n: number) => "$" + n.toLocaleString();

export default function DealPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Full | null>(null);
  const [form, setForm] = useState({ title: "", value: "", stage: "Lead", closeDate: "" });
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/deals/${id}`);
    if (!res.ok) return setMessage("Deal not found.");
    const d: Full = await res.json();
    setDeal(d);
    setForm({ title: d.title, value: String(d.value), stage: d.stage, closeDate: d.closeDate ?? "" });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage("Saved.");
    load();
  }

  async function addNote() {
    if (!note) return;
    await fetch(`/api/deals/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: note }),
    });
    setNote("");
    load();
  }

  async function setDone(taskId: string, done: boolean) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    load();
  }

  if (!deal) return <p className="muted">{message || "Loading..."}</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{deal.title}</h1>
          <p className="sub">
            {money(deal.value)} · <span className="pill">{deal.stage}</span>
            {deal.contact && <> · <Link href={`/contacts/${deal.contact.id}`}>{deal.contact.name}</Link></>}
          </p>
        </div>
        <Link href="/pipeline" className="btn ghost">Back to pipeline</Link>
      </div>

      <div className="card stack">
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Amount<input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>
        <label>Stage
          <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Expected close date<input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} /></label>
        <div className="row">
          <button onClick={save}>Save</button>
          {message && <span className="muted">{message}</span>}
        </div>
      </div>

      <h2>Tasks</h2>
      {deal.tasks.length === 0 ? (
        <div className="empty"><strong>No tasks yet</strong>Add a follow-up for this deal on the <Link href="/tasks">Tasks page</Link>.</div>
      ) : (
        <div className="card">
          <ul className="list">
            {deal.tasks.map((t) => (
              <li key={t.id}>
                <label style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center", color: "inherit", fontSize: 14 }}>
                  <input type="checkbox" style={{ width: "auto" }} checked={t.done} onChange={(e) => setDone(t.id, e.target.checked)} />
                  <span className={`task-title${t.done ? " done" : ""}`}>{t.title}</span>
                </label>
                <span className={t.bucket === "overdue" ? "pill bad" : "muted"}>{t.dueDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>Notes</h2>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <input placeholder="Write a note" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={addNote}>Add note</button>
      </div>
      {deal.notes.length === 0 ? (
        <div className="empty"><strong>No notes yet</strong>Write down what was said.</div>
      ) : (
        <div className="stack">
          {deal.notes.map((n) => (
            <div key={n.id} className="card">
              {n.text}
              <div className="muted" style={{ fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
