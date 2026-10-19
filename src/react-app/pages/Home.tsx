import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MODULES } from "../../modules";
import type { Home as HomeData } from "../../modules/contract";

export default function Home() {
	const [home, setHome] = useState<HomeData>();
	useEffect(() => {
		fetch("/api/home").then(async (r) => r.ok && setHome(await r.json()));
	}, []);
	const hour = new Date().getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	const achievements = (home?.modules ?? [])
		.flatMap((m) => m.achievements.map((a) => ({ ...a, module: MODULES.find((d) => d.id === m.id)?.title })))
		.sort((a, b) => b.at.localeCompare(a.at))
		.slice(0, 5);
	const unread = (home?.modules ?? []).reduce((n, m) => n + m.notifications.length, 0);

	return (
		<>
			<header className="row">
				<h1>{greeting}</h1>
				<div className="streak" title="Daily streak">
					<strong>{home?.streak ?? "–"}</strong>
					<span className="muted">{home?.activeToday ? "day streak" : "days · nothing today yet"}</span>
				</div>
			</header>
			<section className="grid">
				{MODULES.map((d) => {
					const m = home?.modules.find((x) => x.id === d.id);
					const open = m?.goals.filter((g) => !g.done_at).length ?? 0;
					return (
						<Link key={d.id} to={`/${d.id}`} className="tile">
							<strong>{d.title}{m && m.notifications.length > 0 && <span className="badge">{m.notifications.length}</span>}</strong>
							<span className="muted">{m ? `${open} open goal${open === 1 ? "" : "s"}` : d.hint}</span>
						</Link>
					);
				})}
			</section>
			<section className="card">
				<h2>Achievements</h2>
				{achievements.length === 0 && <p className="muted">Reach a goal in any module and it shows up here.</p>}
				{achievements.map((a) => (
					<p key={a.id}><span className="muted">{a.at.slice(0, 10)} · {a.module}</span><br />{a.title}</p>
				))}
				{unread > 0 && <p className="muted">{unread} unread notification{unread === 1 ? "" : "s"} in the modules.</p>}
			</section>
		</>
	);
}
