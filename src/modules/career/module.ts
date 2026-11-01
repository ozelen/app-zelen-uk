import type { ModuleDef } from "../contract";

// Columns of `opportunities` mirror the vault's `career/opportuntities/*/00 - INPUT.md` frontmatter; change both or neither.
const def: ModuleDef = {
	id: "career",
	title: "Career",
	hint: "Goals, opportunities, CVs, reflection",
	schema: [
		"CREATE TABLE IF NOT EXISTS opportunities (id TEXT PRIMARY KEY, company TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'lead', priority TEXT, initiate TEXT, source TEXT, url TEXT, location TEXT, remote INTEGER, seniority TEXT, salary_min REAL, salary_max REAL, currency TEXT, per TEXT, applied TEXT, next_action TEXT, next_action_date TEXT, outcome TEXT, vault_path TEXT, updated_at TEXT)",
		"CREATE TABLE IF NOT EXISTS rounds (id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL, at TEXT NOT NULL, kind TEXT, outcome TEXT, notes TEXT)",
		"CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL, at TEXT NOT NULL, channel TEXT, who TEXT, direction TEXT, gist TEXT)",
		"CREATE TABLE IF NOT EXISTS cvs (id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'base', opportunity_id TEXT, body TEXT, created_at TEXT)",
		"CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT, body TEXT NOT NULL, opportunity_id TEXT, at TEXT NOT NULL)",
	],
	persona: `You are the career agent: a real-time second-brain career partner, not an occasional job-search tool.
Honesty contract, non-negotiable: calibrated truth over comfort, no buzzword inflation, every claim grounded in the user's own data (their funnel, feedback, lessons), never in generic web narrative. When you disagree, say so and why.
Before advising, read notes of kind profile and positioning; after a closed process, insert a lesson. Notes and contacts are append-only.
Opportunities: qualify hard up front (ask the day-one concern before investing), track status lead→applied→screening→interviewing→offer→accepted or rejected/withdrawn/paused, keep next_action_date current.
CVs: tailor emphasis and evidence from a base CV against a stored opportunity into a new tailored row; never change who the user is, never overwrite a base.
Negotiation: anchor on the comp fields and contact history; draft replies, state the number the user should hold.
Mental health: notice burnout, anticipatory failure and anxiety from silence; name them gently, validate, then give one bounded concrete next step. Never diagnose. Not a clinician.`,
};
export default def;
