import { AIChatAgent } from "@cloudflare/ai-chat";
import { getAgentByName } from "agents";
import { createAI } from "agents/models/ai-sdk";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { moduleById } from "../modules";
import { MODULE_TOOLS } from "../modules/server";
import type { ModuleAgent } from "./module-agent";

// One chat session, named `${moduleId}:${userId}:${sessionId}`. Tools act on the user's ModuleAgent.
export class ModuleChat extends AIChatAgent<Env> {
	async onChatMessage() {
		const [moduleId, userId] = this.name.split(":");
		const def = moduleById(moduleId);
		if (!def) throw new Error(`unknown module ${moduleId}`);
		const mod = await getAgentByName(this.env.ModuleAgent as DurableObjectNamespace<ModuleAgent>, `${moduleId}:${userId}`);
		const tables = await mod.tables;
		const ai = createAI({ binding: this.env.AI });
		const result = streamText({
			model: ai(this.env.MODEL),
			system: `${def.persona}
Today is ${new Date().toISOString().slice(0, 10)}. Be direct and concise.
You keep structured data in SQLite tables: ${tables.join(", ")}. Module tables:
${def.schema.join("\n")}
Use the tools to read and write; never invent data. Backend tools (fin_*) are the source of truth; the module tables are your working copy. After logging anything, confirm in one line.`,
			messages: await convertToModelMessages(this.messages),
			stopWhen: stepCountIs(6),
			tools: {
				...(MODULE_TOOLS[moduleId]?.({ env: this.env, userId, mod }) ?? {}),
				query: tool({ description: "Run a read-only SELECT over the module tables", inputSchema: z.object({ sql: z.string() }), execute: ({ sql }) => mod.query(sql) }),
				insert: tool({ description: "Insert one row into a module table", inputSchema: z.object({ table: z.string(), row: z.record(z.string(), z.union([z.string(), z.number(), z.null()])) }), execute: ({ table, row }) => mod.insert(table, row) }),
				add_goal: tool({ description: "Create a goal", inputSchema: z.object({ title: z.string(), target: z.number().nullable(), unit: z.string().nullable(), due: z.string().nullable() }), execute: (g) => mod.addGoal(g) }),
				update_goal: tool({ description: "Set a goal's progress; done marks it reached", inputSchema: z.object({ id: z.string(), progress: z.number(), done: z.boolean().default(false) }), execute: ({ id, progress, done }) => mod.updateGoal(id, progress, done) }),
				log_metric: tool({ description: "Record a numeric metric (weight, kcal, hours…)", inputSchema: z.object({ key: z.string(), value: z.number() }), execute: ({ key, value }) => mod.logMetric(key, value) }),
				notify: tool({ description: "Leave a notification for the user on the module page", inputSchema: z.object({ title: z.string(), body: z.string().optional() }), execute: ({ title, body }) => mod.notify(title, body) }),
			},
		});
		return result.toUIMessageStreamResponse();
	}
}
