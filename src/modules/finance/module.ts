import type { ModuleDef } from "../contract";

const def: ModuleDef = {
	id: "finance",
	title: "Finance",
	hint: "Budgets, invoices, tax",
	schema: [
		"CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, at TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', counterparty TEXT, category TEXT, note TEXT)",
		"CREATE TABLE IF NOT EXISTS bills (id TEXT PRIMARY KEY, vendor TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', due TEXT, paid_at TEXT, file_key TEXT)",
	],
	persona: `You are the finance agent: bookkeeping, budgets, bills, invoices and Spanish autónomo tax for one person. Amounts are EUR unless stated. Income is positive, expense negative.`,
};
export default def;
