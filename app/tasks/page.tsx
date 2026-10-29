"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Contact, Deal, TaskWithBucket } from "@/lib/types";

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskWithBucket[] | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [t, c, d] = await Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/deals").then((r) => r.json()),
    ]);
    setTasks(t); setContacts(c); setDeals(d);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate, contactId, dealId }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setTitle(""); setDueDate(""); setContactId(""); setDealId(""); setMessage("");
    load();
  }

  async function setDone(id: string, done: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    load();
  }

  const contactName = (id: string) => contacts.find((c) => c.id === id)?.name;
  const dealTitle = (id: string) => deals.find((d) => d.id === id)?.title;

  function section(heading: string, bucket: TaskWithBucket["bucket"], empty: string) {
    const rows = (tasks ?? []).filter((t) => t.bucket === bucket);
    return (
      <>
        <h2>{heading} ({rows.length})</h2>
        {rows.length === 0 ? (
          <div className="empty">{empty}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Task</th><th>Due</th><th>Linked to</th></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td><input type="checkbox" aria-label={`Mark done: ${t.title}`} style={{ width: "auto" }} checked={t.done} onChange={(e) => setDone(t.id, e.target.checked)} /></td>
                    <td className={`wrap task-title${t.done ? " done" : ""}`}>{t.title}</td>
                    <td>{bucket === "overdue" ? <span className="pill bad">{t.dueDate}</span> : t.dueDate}</td>
                    <td className="wrap">
                      {t.contactId && contactName(t.contactId) && <Link href={`/contacts/${t.contactId}`}>{contactName(t.contactId)}</Link>}
                      {t.contactId && t.dealId && " · "}
                      {t.dealId && dealTitle(t.dealId) && <Link href={`/deals/${t.dealId}`}>{dealTitle(t.dealId)}</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <p className="sub">Follow-ups, sorted by when they are due.</p>
        </div>
      </div>

      <div className="card form-row">
        <input placeholder="New task, for example: Call Maria" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flexBasis: 240 }} />
        <input type="date" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <select aria-label="Contact" value={contactId} onChange={(e) => setContactId(e.target.value)}>
          <option value="">No contact</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select aria-label="Deal" value={dealId} onChange={(e) => setDealId(e.target.value)}>
          <option value="">No deal</option>
          {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <button onClick={add}>Add task</button>
      </div>
      {message && <p className="error">{message}</p>}

      {!tasks ? <p className="muted">Loading...</p> : tasks.length === 0 ? (
        <div className="empty" style={{ marginTop: 16 }}><strong>No tasks yet</strong>Add a follow-up above and it shows up here.</div>
      ) : (
        <>
          {section("Overdue", "overdue", "Nothing overdue.")}
          {section("Due today", "today", "Nothing due today.")}
          {section("Upcoming", "upcoming", "Nothing coming up.")}
          {section("Done", "done", "No finished tasks yet.")}
        </>
      )}
    </>
  );
}
