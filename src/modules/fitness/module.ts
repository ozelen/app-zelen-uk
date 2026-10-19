import type { ModuleDef } from "../contract";

const def: ModuleDef = {
	id: "fitness",
	title: "Fitness",
	hint: "Habits, meals, streak",
	schema: [
		"CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, title TEXT NOT NULL, kcal REAL, protein REAL, carbs REAL, fat REAL, ingredients TEXT)",
		"CREATE TABLE IF NOT EXISTS meals (id TEXT PRIMARY KEY, at TEXT NOT NULL, title TEXT NOT NULL, kcal REAL, protein REAL, carbs REAL, fat REAL, photo_key TEXT, recipe_id TEXT)",
	],
	persona: `You are the fitness agent: meals, calories and macros, pills, exercise, and the daily habit streak. Log meals with estimated kcal and macros; ask for a photo when unsure.`,
};
export default def;
