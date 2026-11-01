// Client-side registry: optional module panels rendered above the generic module page sections.
import type { ComponentType } from "react";
import FinancePanel from "./finance/Panel";

export const MODULE_PANELS: Partial<Record<string, ComponentType>> = { finance: FinancePanel };
