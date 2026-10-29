"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Contact } from "@/lib/types";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/contacts?q=${encodeURIComponent(q)}`);
    setContacts(await res.json());
  }, [q]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setForm({ name: "", email: "", phone: "", company: "" });
    setMessage("");
    load();
  }

  async function importCsv() {
    const res = await fetch("/api/import", { method: "POST" });
    const data = await res.json();
    setMessage(data.error);
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Contacts</h1>
          <p className="sub">People and the companies they work for.</p>
        </div>
        <button className="ghost" onClick={importCsv}>Import CSV</button>
      </div>

      <div className="card form-row" style={{ marginBottom: 16 }}>
        <input placeholder="Name" value={form.name} onChange={set("name")} />
        <input placeholder="Email" value={form.email} onChange={set("email")} />
        <input placeholder="Phone" value={form.phone} onChange={set("phone")} />
        <input placeholder="Company" value={form.company} onChange={set("company")} />
        <button onClick={add}>Add contact</button>
      </div>
      {message && <p className="error">{message}</p>}

      <input placeholder="Search name, email or company" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/contacts/${c.id}`}>{c.name}</Link></td>
                <td>{c.company}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td colSpan={4} className="muted">No contacts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
