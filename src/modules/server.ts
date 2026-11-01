// Server-only registry: module tools, routes and dashboard cards that talk to backends. Never imported by the client bundle.
import type { Hono } from "hono";
import type { ToolSet } from "ai";
import type { ModuleAgent } from "../worker/module-agent";
import { tools as financeTools } from "./finance/tools";
import { routes as financeRoutes, dashboard as financeDashboard } from "./finance/routes";

export type ModuleTools = (ctx: { env: Env; userId: string; mod: DurableObjectStub<ModuleAgent> }) => ToolSet;
export const MODULE_TOOLS: Partial<Record<string, ModuleTools>> = { finance: financeTools };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MODULE_ROUTES: Partial<Record<string, Hono<any>>> = { finance: financeRoutes };
export const MODULE_DASHBOARD: Partial<Record<string, (env: Env, email: string) => Promise<Record<string, unknown>>>> = { finance: financeDashboard };
