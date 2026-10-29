"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Contact, Deal, TaskWithBucket } from "@/lib/types";

type Full = Contact & { deals: Deal[]; tasks: TaskWithBucket[] };

export default function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Full | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/contacts/${id}`);
    if (!res.ok) return setMessage("Contact not found.");
    const c: Full = await res.json();
    setContact(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage("Saved.");
    load();
  }

  async function addNote() {
    if (!note) return;
    await fetch(`/api/contacts/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: note }),
    });
    setNote("");
    load();
  }

  async function addTask() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle, dueDate: taskDate, contactId: id }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setTaskTitle(""); setTaskDate(""); setMessage("");
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

  async function remove() {
    // ZOMBIE: no "are you sure?" and no undo. One click and the contact and their deals are gone.
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    router.push("/contacts");
  }

  if (!contact) return <p className="muted">{message || "Loading..."}</p>;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{contact.name}</h1>
          <p className="sub">{contact.company || "No company"}</p>
        </div>
        <Link href="/contacts" className="btn ghost">All contacts</Link>
      </div>

      <div className="card stack">
        <label>Name<input value={form.name} onChange={set("name")} /></label>
        <label>Email<input value={form.email} onChange={set("email")} /></label>
        <label>Phone<input value={form.phone} onChange={set("phone")} /></label>
        <label>Company<input value={form.company} onChange={set("company")} /></label>
        <div className="row">
          <button onClick={save}>Save</button>
          <button className="ghost" onClick={remove}>Delete contact</button>
          {message && <span className="muted">{message}</span>}
        </div>
      </div>

      <h2>Deals</h2>
      {contact.deals.length === 0 ? <div className="empty"><strong>No deals yet</strong>Add one from the Pipeline page.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Deal</th><th>Amount</th><th>Stage</th><th>Close date</th></tr></thead>
            <tbody>
              {contact.deals.map((d) => (
                <tr key={d.id}>
                  <td><Link href={`/deals/${d.id}`}>{d.title}</Link></td>
                  <td>${d.value.toLocaleString()}</td>
                  <td><span className="pill">{d.stage}</span></td>
                  <td>{d.closeDate || "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Tasks</h2>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <input placeholder="New task, for example: Call back" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
        <input type="date" aria-label="Due date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
        <button onClick={addTask}>Add task</button>
      </div>
      {contact.tasks.length === 0 ? (
        <div className="empty"><strong>No tasks yet</strong>Add a follow-up for {contact.name}.</div>
      ) : (
        <div className="card">
          <ul className="list">
            {contact.tasks.map((t) => (
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
      {contact.notes.length === 0 && <div className="empty"><strong>No notes yet</strong>Write down what was said.</div>}
      <div className="stack">
        {contact.notes.map((n) => (
          <div key={n.id} className="card">
            {n.text}
            <div className="muted" style={{ fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </>
  );
}
