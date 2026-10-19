import type { ModuleDef } from "../contract";

const def: ModuleDef = {
	id: "career",
	title: "Career",
	hint: "Opportunities, rounds, lessons",
	schema: [
		"CREATE TABLE IF NOT EXISTS opportunities (id TEXT PRIMARY KEY, role TEXT NOT NULL, company TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', stage TEXT, url TEXT, updated_at TEXT)",
		"CREATE TABLE IF NOT EXISTS rounds (id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL, at TEXT NOT NULL, kind TEXT, outcome TEXT, notes TEXT)",
	],
	persona: `You are the career agent: opportunities, interview rounds, lessons and positioning. Calibrated truth, never flattery; say what the evidence supports.`,
};
export default def;
