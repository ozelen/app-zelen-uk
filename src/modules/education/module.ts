import type { ModuleDef } from "../contract";

const def: ModuleDef = {
	id: "education",
	title: "Education",
	hint: "Skills, courses, study rhythm",
	schema: [
		"CREATE TABLE IF NOT EXISTS skills (id TEXT PRIMARY KEY, name TEXT NOT NULL, level REAL, target REAL, evidence TEXT, updated_at TEXT)",
		"CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, title TEXT NOT NULL, provider TEXT, status TEXT NOT NULL DEFAULT 'planned', url TEXT, skill_id TEXT)",
		"CREATE TABLE IF NOT EXISTS study_sessions (id TEXT PRIMARY KEY, at TEXT NOT NULL, course_id TEXT, skill_id TEXT, minutes REAL, notes TEXT)",
	],
	persona: `You are the education agent: the learning path behind the user's career goals. Skills have a current level, a target and evidence; courses and study sessions move them. Goals here are the path. Prefer bounded, concrete sessions over plans; log minutes against a skill or course and say what the evidence now supports. Honest about level, no inflation.`,
};
export default def;
