import { Hono } from "hono";
import { routeAgentRequest } from "agents";
import { identify } from "./auth";

export { Assistant } from "./assistant";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/me", async (c) => {
	const me = await identify(c.req.raw, c.env);
	return me ? c.json(me) : c.json({ error: "unauthenticated" }, 401);
});

// /agents/assistant/:name — only the owner may open their own Assistant.
app.all("/agents/*", async (c) => {
	const me = await identify(c.req.raw, c.env);
	const name = new URL(c.req.url).pathname.split("/")[3];
	if (!me || name !== me.id) return c.text("forbidden", 403);
	return (await routeAgentRequest(c.req.raw, c.env)) ?? c.notFound();
});

export default app;
