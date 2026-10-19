// The contract every module implements. A module team owns src/modules/<id>/ and nothing else.
export type ModuleId = "finance" | "fitness" | "career" | "education";

export type ModuleDef = {
	id: ModuleId;
	title: string;
	hint: string;
	/** Extra SQLite tables for this module's structured data (CREATE TABLE IF NOT EXISTS …). */
	schema: string[];
	/** What the module agent is for; appended to the shared system prompt. */
	persona: string;
};

/** SQLite row; only RPC-serializable scalars so Durable Object stubs keep their types. */
export type Row = Record<string, string | number | boolean | null>;

export type Goal = { id: string; title: string; target: number | null; progress: number; unit: string | null; due: string | null; done_at: string | null };
export type Metric = { key: string; value: number; at: string };
export type Achievement = { id: string; title: string; at: string };
export type Notification = { id: string; title: string; body: string | null; at: string; read_at: string | null };
export type Session = { id: string; title: string; created_at: string };

export type ModuleSummary = {
	id: ModuleId;
	goals: Goal[];
	metrics: Metric[];
	achievements: Achievement[];
	notifications: Notification[];
	sessions: Session[];
	activityDates: string[];
};

export type Home = { streak: number; activeToday: boolean; modules: ModuleSummary[] };

export type Profile = { name: string; timezone: string; about: string };
export type AssistantState = { profile: Profile };
