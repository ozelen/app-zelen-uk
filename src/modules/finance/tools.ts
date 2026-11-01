import { tool } from "ai";
import { z } from "zod";
import type { ModuleTools } from "../server";
import { finJson } from "./fin";

type FinTx = { id: number; operation_date: string; concept: string; counterparty: string; amount: string; currency: string; tags?: { name?: string; tag?: { name?: string } }[] };
const range = { date_from: z.string().optional().describe("YYYY-MM-DD"), date_to: z.string().optional(), year: z.number().optional(), quarter: z.number().optional(), keyword: z.string().optional(), counterparty: z.string().optional(), tags: z.string().optional().describe("comma-separated tag names") };

export const tools: ModuleTools = ({ env, userId, mod }) => ({
	fin_totals: tool({
		description: "Totals from the fin.zelen.uk ledger (income, expense, net per currency and in EUR) for a filter",
		inputSchema: z.object(range),
		execute: (p) => finJson(env, userId, "/api/transactions/summary/", p),
	}),
	fin_transactions: tool({
		description: "Fetch bank transactions from fin.zelen.uk for a filter and mirror them into the module's transactions table",
		inputSchema: z.object({ ...range, page_size: z.number().max(200).default(50) }),
		execute: async (p) => {
			const { results } = await finJson<{ results: FinTx[] }>(env, userId, "/api/transactions/", p);
			for (const t of results) {
				await mod.upsert("transactions", {
					id: `fin:${t.id}`, at: t.operation_date, amount: Number(t.amount), currency: t.currency,
					counterparty: t.counterparty || null, category: t.tags?.map((x) => x.name ?? x.tag?.name).filter(Boolean).join(",") || null, note: t.concept,
				});
			}
			return results.map((t) => ({ date: t.operation_date, amount: t.amount, currency: t.currency, counterparty: t.counterparty, concept: t.concept.slice(0, 80) }));
		},
	}),
	fin_forecast: tool({
		description: "Recurring payments still due this and next month, from fin.zelen.uk",
		inputSchema: z.object({}),
		execute: () => finJson(env, userId, "/api/recurrences/forecast/"),
	}),
});
