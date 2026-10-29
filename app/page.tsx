"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STAGES } from "@/lib/types";
import type { ActivityLine, TaskWithBucket } from "@/lib/types";

type Dash = {
  perStage: Record<string, number>;
  openValue: number;
  wonThisMonth: { count: number; value: number };
  dueToday: TaskWithBucket[];
  overdueCount: number;
  recentActivity: ActivityLine[];
};

const money = (n: number) => "$" + n.toLocaleString();

export default function Dashboard() {
  const [data, setData] = useState<Dash | null>(null);

  const load = useCallback(async () => {
    setData(await fetch("/api/dashboard").then((r) => r.json()));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markDone(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    load();
  }

  if (!data) return <p className="muted">Loading...</p>;
  const biggest = Math.max(1, ...Object.values(data.perStage));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Your pipeline, your tasks, and what just happened.</p>
        </div>
        <Link href="/pipeline" className="btn">Open pipeline</Link>
      </div>

      <div className="stats">
        <div className="stat"><div className="num">{money(data.openValue)}</div><div className="label">Open pipeline value</div></div>
        <div className="stat">
          <div className="num">{data.wonThisMonth.count}</div>
          <div className="label">Deals won this month ({money(data.wonThisMonth.value)})</div>
        </div>
        <div className="stat"><div className="num">{data.dueToday.length}</div><div className="label">Tasks due today</div></div>
        <div className="stat"><div className="num">{data.overdueCount}</div><div className="label">Overdue tasks</div></div>
      </div>

      <h2>Pipeline value by stage</h2>
      <div className="card bars">
        {STAGES.map((stage) => (
          <div className="bar-row" key={stage}>
            <span>{stage}</span>
            <div className="bar-track"><div className={`bar-fill ${stage}`} style={{ width: `${(data.perStage[stage] / biggest) * 100}%` }} /></div>
            <span className="bar-val">{money(data.perStage[stage])}</span>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 8 }}>
        <div>
          <div className="section-head"><h2>Due today</h2><Link href="/tasks">All tasks</Link></div>
          {data.dueToday.length === 0 ? (
            <div className="empty"><strong>Nothing due today</strong>Enjoy it, or add a follow-up on the Tasks page.</div>
          ) : (
            <div className="card">
              <ul className="list">
                {data.dueToday.map((t) => (
                  <li key={t.id}>
                    <span>{t.title}</span>
                    <button className="ghost btn-sm" onClick={() => markDone(t.id)}>Done</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <div className="section-head"><h2>Recent activity</h2></div>
          {data.recentActivity.length === 0 ? (
            <div className="empty"><strong>No activity yet</strong>Add a note, a deal or a task and it shows up here.</div>
          ) : (
            <div className="card">
              <ul className="list">
                {data.recentActivity.map((a) => (
                  <li key={a.id}>
                    <span>{a.href ? <Link href={a.href}>{a.text}</Link> : a.text}</span>
                    <span className="when">{new Date(a.at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
