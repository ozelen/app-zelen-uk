import type { ModuleDef, ModuleId } from "./contract";
import finance from "./finance/module";
import fitness from "./fitness/module";
import career from "./career/module";
import education from "./education/module";

export const MODULES: ModuleDef[] = [finance, fitness, career, education];
export const moduleById = (id: string): ModuleDef | undefined => MODULES.find((m) => m.id === (id as ModuleId));
