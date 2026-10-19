import type { ModuleDef } from "../contract";

const def: ModuleDef = {
	id: "education",
	title: "Education",
	hint: "Courses, reading, practice",
	schema: [
		"CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, title TEXT NOT NULL, provider TEXT, status TEXT NOT NULL DEFAULT 'planned', url TEXT)",
		"CREATE TABLE IF NOT EXISTS study_sessions (id TEXT PRIMARY KEY, at TEXT NOT NULL, course_id TEXT, minutes REAL, notes TEXT)",
	],
	persona: `You are the education agent: courses, reading, deliberate practice, and keeping a study rhythm.`,
};
export default def;
