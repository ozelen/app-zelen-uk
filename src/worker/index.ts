import { Hono } from "hono";
import { getAgentByName, routeAgentRequest } from "agents";
import { identify } from "./auth";
import { MODULES, moduleById } from "../modules";
import type { ModuleAgent } from "./module-agent";
import type { Home } from "../modules/contract";

export { Assistant } from "./assistant";
export { ModuleAgent } from "./module-agent";
export { ModuleChat } from "./module-chat";

type Ctx = { Bindings: Env; Variables: { me: { email: string; id: string } } };
const app = new Hono<Ctx>();

app.use("*", async (c, next) => {
	const me = await identify(c.req.raw, c.env);
	if (!me) return c.json({ error: "unauthenticated" }, 401);
	c.set("me", me);
	await next();
});

const modAgent = (env: Env, moduleId: string, userId: string) =>
	getAgentByName(env.ModuleAgent as DurableObjectNamespace<ModuleAgent>, `${moduleId}:${userId}`);

app.get("/api/me", (c) => c.json(c.get("me")));

app.get("/api/home", async (c) => {
	const me = c.get("me");
	const modules = await Promise.all(MODULES.map(async (m) => (await modAgent(c.env, m.id, me.id)).summary()));
	// ponytail: a day counts if any module saw activity; per-module rules when habits exist.
	const days = new Set(modules.flatMap((m) => m.activityDates));
	let streak = 0;
	const d = new Date();
	if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
	while (days.has(d.toISOString().slice(0, 10))) {
		streak++;
		d.setDate(d.getDate() - 1);
	}
	const home: Home = { streak, activeToday: days.has(new Date().toISOString().slice(0, 10)), modules };
	return c.json(home);
});

app.get("/api/modules/:id", async (c) => {
	if (!moduleById(c.req.param("id"))) return c.notFound();
	return c.json(await (await modAgent(c.env, c.req.param("id"), c.get("me").id)).summary());
});

app.post("/api/modules/:id/sessions", async (c) => {
	if (!moduleById(c.req.param("id"))) return c.notFound();
	const { title } = await c.req.json<{ title?: string }>().catch(() => ({ title: undefined }));
	return c.json(await (await modAgent(c.env, c.req.param("id"), c.get("me").id)).createSession(title));
});

app.get("/api/modules/:id/data/:table", async (c) => {
	const def = moduleById(c.req.param("id"));
	if (!def?.schema.some((s) => s.includes(`EXISTS ${c.req.param("table")} `))) return c.notFound();
	return c.json(await (await modAgent(c.env, c.req.param("id"), c.get("me").id)).rows_(c.req.param("table"), 30));
});

app.post("/api/modules/:id/notifications/:nid/read", async (c) => {
	await (await modAgent(c.env, c.req.param("id"), c.get("me").id)).markRead(c.req.param("nid"));
	return c.body(null, 204);
});

// /agents/:class/:name — a user may only open agents named with their own id.
app.all("/agents/*", async (c) => {
	const me = c.get("me");
	const [, , cls, name = ""] = new URL(c.req.url).pathname.split("/");
	const owner = cls === "assistant" ? name : name.split(":")[1];
	if (owner !== me.id) return c.text("forbidden", 403);
	return (await routeAgentRequest(c.req.raw, c.env)) ?? c.notFound();
});

export default app;
