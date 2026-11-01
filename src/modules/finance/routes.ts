import { Hono } from "hono";
import { finFetch, finJson } from "./fin";

type Ctx = { Bindings: Env; Variables: { me: { email: string; id: string } } };
type Account = { id: number; name: string; kind: string; currency: string };
type Upload = { id: number; original_filename: string; account_label: string; row_count: number; imported_count: number; created_at: string };

// Finance module routes, mounted at /api/modules/finance. Thin pass-through to fin.zelen.uk as the user.
export const routes = new Hono<Ctx>()
	.get("/accounts", async (c) => {
		const all = await finJson<Account[] | { results: Account[] }>(c.env, c.get("me").email, "/api/accounts/");
		return c.json((Array.isArray(all) ? all : all.results).filter((a) => a.kind === "bank"));
	})
	.get("/uploads", async (c) => {
		const r = await finJson<Upload[] | { results: Upload[] }>(c.env, c.get("me").email, "/api/uploads/", { ordering: "-created_at" });
		return c.json(Array.isArray(r) ? r : r.results);
	})
	.post("/uploads", async (c) => {
		const form = await c.req.formData();
		if (!form.get("account")) return c.json({ detail: "Pick the bank account first." }, 400);
		const r = await finFetch(c.env, c.get("me").email, "/api/uploads/", { method: "POST", body: form });
		return c.body(await r.text(), r.status as 201, { "content-type": "application/json" });
	})
	.delete("/uploads/:id", async (c) => {
		const r = await finFetch(c.env, c.get("me").email, `/api/uploads/${c.req.param("id")}/`, { method: "DELETE" });
		return c.body(null, r.status as 204);
	})
	.post("/receipts", async (c) => {
		const form = await c.req.formData();
		const r = await finFetch(c.env, c.get("me").email, "/api/receipts/", { method: "POST", body: form });
		return c.body(await r.text(), r.status as 201, { "content-type": "application/json" });
	});

export async function dashboard(env: Env, email: string) {
	const now = new Date();
	const from = `${now.toISOString().slice(0, 7)}-01`;
	const [summary, forecast] = await Promise.all([
		finJson<{ income_eur?: number; expense_eur?: number; net_eur?: number; currencies?: { currency: string; income: number; expense: number; net: number }[] }>(env, email, "/api/transactions/summary/", { date_from: from }),
		finJson<Record<string, unknown>>(env, email, "/api/recurrences/forecast/").catch(() => ({})),
	]);
	const eur = summary.currencies?.find((x) => x.currency === "EUR");
	return { month: from.slice(0, 7), income: summary.income_eur ?? eur?.income ?? 0, expense: summary.expense_eur ?? eur?.expense ?? 0, net: summary.net_eur ?? eur?.net ?? 0, forecast };
}
