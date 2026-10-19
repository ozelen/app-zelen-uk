import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { MODULES } from "../../modules";
import type { ModuleSummary } from "../../modules/contract";

export default function ModulePage() {
	const { module } = useParams();
	const def = MODULES.find((m) => m.id === module);
	const nav = useNavigate();
	const [s, setS] = useState<ModuleSummary>();
	const load = () => def && fetch(`/api/modules/${def.id}`).then(async (r) => r.ok && setS(await r.json()));
	useEffect(() => { load(); }, [module]); // eslint-disable-line react-hooks/exhaustive-deps
	if (!def) return <p>Not found. <Link to="/">Home</Link></p>;

	const newChat = async () => {
		const r = await fetch(`/api/modules/${def.id}/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
		const session = await r.json();
		nav(`/${def.id}/chat/${session.id}`);
	};
	const read = async (id: string) => {
		await fetch(`/api/modules/${def.id}/notifications/${id}/read`, { method: "POST" });
		load();
	};

	return (
		<>
			<header className="row"><div><h1>{def.title}</h1><p className="muted">{def.hint}</p></div><button onClick={newChat}>New chat</button></header>
			{s?.notifications.length ? (
				<section className="card">
					<h2>Notifications</h2>
					{s.notifications.map((n) => (
						<p key={n.id} className="row"><span><strong>{n.title}</strong>{n.body && <><br /><span className="muted">{n.body}</span></>}</span><button className="link" onClick={() => read(n.id)}>Done</button></p>
					))}
				</section>
			) : null}
			<section className="card">
				<h2>Goals</h2>
				{!s?.goals.length && <p className="muted">No goals yet. Ask the {def.title.toLowerCase()} agent to set one.</p>}
				{s?.goals.map((g) => (
					<p key={g.id} className={g.done_at ? "muted" : ""}>
						{g.title}{g.target != null && <span className="muted"> · {g.progress}/{g.target} {g.unit ?? ""}</span>}{g.due && <span className="muted"> · due {g.due}</span>}{g.done_at && " ✓"}
					</p>
				))}
			</section>
			{s?.metrics.length ? (
				<section className="card">
					<h2>Metrics</h2>
					{s.metrics.map((m) => (<p key={m.key}>{m.key}: <strong>{m.value}</strong> <span className="muted">{m.at.slice(0, 10)}</span></p>))}
				</section>
			) : null}
			<section className="card">
				<h2>Chats</h2>
				{!s?.sessions.length && <p className="muted">No chats yet.</p>}
				{s?.sessions.map((c) => (<p key={c.id}><Link to={`/${def.id}/chat/${c.id}`}>{c.title}</Link> <span className="muted">{c.created_at.slice(0, 10)}</span></p>))}
			</section>
		</>
	);
}
