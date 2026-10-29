// Shapes of the records we keep in data/db.json.
export const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const;
export type Stage = (typeof STAGES)[number];

export type Note = { id: string; text: string; createdAt: string };

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: Note[];
};

export type Deal = {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: Stage;
  closeDate?: string; // "YYYY-MM-DD", the day you expect to close (or did close)
  notes?: Note[];
};

// A follow-up task. It links to a contact, a deal, both, or neither.
// ZOMBIE: tasks have no owner. There is no "assigned to" field, so every visitor sees and can change every task.
export type Task = {
  id: string;
  title: string;
  dueDate: string; // "YYYY-MM-DD"
  contactId: string;
  dealId: string;
  done: boolean;
  doneAt?: string;
};

// One line in the "recent activity" feed on the dashboard.
export type ActivityLine = { id: string; text: string; at: string; href?: string };

// Task plus the bucket the server worked out for it.
export type TaskWithBucket = Task & { bucket: "overdue" | "today" | "upcoming" | "done" };
