import { Agent } from "agents";
import { moduleById } from "../modules";
import type { Goal, ModuleSummary, Row, Session } from "../modules/contract";

const BASE_SCHEMA = [
	"CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY, title TEXT NOT NULL, target REAL, progress REAL NOT NULL DEFAULT 0, unit TEXT, due TEXT, done_at TEXT, created_at TEXT NOT NULL)",
	"CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL, value REAL NOT NULL, at TEXT NOT NULL)",
	"CREATE TABLE IF NOT EXISTS achievements (id TEXT PRIMARY KEY, title TEXT NOT NULL, at TEXT NOT NULL)",
	"CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT, at TEXT NOT NULL, read_at TEXT)",
	"CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL)",
	"CREATE TABLE IF NOT EXISTS activity (day TEXT PRIMARY KEY)",
];
const BASE_TABLES = ["goals", "metrics", "achievements", "notifications", "sessions", "activity"];
const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);

// One per user per module, named `${moduleId}:${userId}`. Holds the module's structured data in SQLite.
export class ModuleAgent extends Agent<Env> {
	get moduleId() {
		return this.name.split(":")[0];
	}
	get def() {
		const d = moduleById(this.moduleId);
		if (!d) throw new Error(`unknown module ${this.moduleId}`);
		return d;
	}
	get tables() {
		return [...BASE_TABLES, ...this.def.schema.map((s) => s.match(/EXISTS (\w+)/)![1])];
	}

	onStart() {
		for (const stmt of [...BASE_SCHEMA, ...this.def.schema]) this.ctx.storage.sql.exec(stmt);
	}

	private rows<T>(sql: string, ...params: unknown[]): T[] {
		return this.ctx.storage.sql.exec(sql, ...params).toArray() as T[];
	}
	private touch() {
		this.ctx.storage.sql.exec("INSERT OR IGNORE INTO activity (day) VALUES (?)", today());
	}

	summary(): ModuleSummary {
		return {
			id: this.def.id,
			goals: this.rows("SELECT * FROM goals ORDER BY done_at IS NOT NULL, due, created_at"),
			metrics: this.rows("SELECT key, value, at FROM metrics WHERE id IN (SELECT MAX(id) FROM metrics GROUP BY key) ORDER BY at DESC"),
			achievements: this.rows("SELECT * FROM achievements ORDER BY at DESC LIMIT 10"),
			notifications: this.rows("SELECT * FROM notifications WHERE read_at IS NULL ORDER BY at DESC LIMIT 20"),
			sessions: this.rows("SELECT * FROM sessions ORDER BY created_at DESC LIMIT 20"),
			activityDates: this.rows<{ day: string }>("SELECT day FROM activity ORDER BY day DESC LIMIT 400").map((r) => r.day),
		};
	}

	// ponytail: the agent talks SQL to its own tables; typed tools per module when this misbehaves.
	query(sql: string): Row[] {
		if (!/^\s*select\b/i.test(sql) || /;/.test(sql)) throw new Error("read-only SELECT only");
		return this.rows(sql);
	}
	insert(table: string, row: Row): string {
		if (!this.tables.includes(table) || table === "activity") throw new Error(`unknown table ${table}`);
		const cols = Object.keys(row).filter((c) => /^\w+$/.test(c));
		const id = typeof row.id === "string" ? row.id : crypto.randomUUID();
		if (!cols.includes("id")) cols.push("id");
		row = { ...row, id };
		this.ctx.storage.sql.exec(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => row[c] ?? null));
		this.touch();
		return id;
	}
	addGoal(g: Pick<Goal, "title" | "target" | "unit" | "due">): Goal {
		const id = crypto.randomUUID();
		this.ctx.storage.sql.exec("INSERT INTO goals (id,title,target,unit,due,created_at) VALUES (?,?,?,?,?,?)", id, g.title, g.target ?? null, g.unit ?? null, g.due ?? null, now());
		this.touch();
		return this.rows<Goal>("SELECT * FROM goals WHERE id = ?", id)[0];
	}
	updateGoal(id: string, progress: number, done = false) {
		this.ctx.storage.sql.exec("UPDATE goals SET progress = ?, done_at = COALESCE(done_at, ?) WHERE id = ?", progress, done ? now() : null, id);
		if (done) this.achieve(`Goal reached: ${this.rows<Goal>("SELECT title FROM goals WHERE id = ?", id)[0]?.title}`);
		this.touch();
	}
	logMetric(key: string, value: number) {
		this.ctx.storage.sql.exec("INSERT INTO metrics (key,value,at) VALUES (?,?,?)", key, value, now());
		this.touch();
	}
	achieve(title: string) {
		this.ctx.storage.sql.exec("INSERT INTO achievements (id,title,at) VALUES (?,?,?)", crypto.randomUUID(), title, now());
	}
	notify(title: string, body?: string) {
		this.ctx.storage.sql.exec("INSERT INTO notifications (id,title,body,at) VALUES (?,?,?,?)", crypto.randomUUID(), title, body ?? null, now());
	}
	markRead(id: string) {
		this.ctx.storage.sql.exec("UPDATE notifications SET read_at = ? WHERE id = ?", now(), id);
	}
	createSession(title = "New chat"): Session {
		const s = { id: crypto.randomUUID().slice(0, 8), title, created_at: now() };
		this.ctx.storage.sql.exec("INSERT INTO sessions (id,title,created_at) VALUES (?,?,?)", s.id, s.title, s.created_at);
		return s;
	}
}
