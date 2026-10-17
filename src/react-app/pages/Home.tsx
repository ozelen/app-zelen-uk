import { Link } from "react-router";
import type { Me } from "../App";

export const DOMAINS = [
	{ slug: "finance", title: "Finance", hint: "Budgets, invoices, tax", live: "https://fin.zelen.uk" },
	{ slug: "fitness", title: "Fitness", hint: "Habits, meals, streak", live: "https://fit.zelen.uk" },
	{ slug: "career", title: "Career", hint: "Opportunities, rounds, lessons" },
	{ slug: "education", title: "Education", hint: "Courses, reading, practice" },
];

export default function Home({ me }: { me: Me }) {
	const hour = new Date().getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	return (
		<>
			<header>
				<h1>{greeting}</h1>
				<p className="muted">{me.email}</p>
			</header>
			<section className="card">
				<h2>Today</h2>
				<p className="muted">Streak and nudges appear here once the first habits exist.</p>
				<Link className="button" to="/chat">Ask the assistant</Link>
			</section>
			<section className="grid">
				{DOMAINS.map((d) => (
					<Link key={d.slug} to={`/${d.slug}`} className="tile">
						<strong>{d.title}</strong>
						<span className="muted">{d.hint}</span>
					</Link>
				))}
			</section>
		</>
	);
}
