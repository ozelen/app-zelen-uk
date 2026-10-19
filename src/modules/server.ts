// Server-only registry: module tools that talk to backends. Never imported by the client bundle.
import type { ToolSet } from "ai";
import type { ModuleAgent } from "../worker/module-agent";
import { tools as finance } from "./finance/tools";

export type ModuleTools = (ctx: { env: Env; userId: string; mod: DurableObjectStub<ModuleAgent> }) => ToolSet;
export const MODULE_TOOLS: Partial<Record<string, ModuleTools>> = { finance };
