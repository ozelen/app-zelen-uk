import { Link, useParams } from "react-router";
import { DOMAINS } from "./Home";

export default function Domain() {
	const { domain } = useParams();
	const d = DOMAINS.find((x) => x.slug === domain);
	if (!d) return <p>Not found. <Link to="/">Home</Link></p>;
	return (
		<>
			<header><h1>{d.title}</h1><p className="muted">{d.hint}</p></header>
			<section className="card">
				<p>Nothing here yet. The assistant already knows this domain exists.</p>
				{d.live && <a className="button" href={d.live} target="_blank" rel="noreferrer">Open {new URL(d.live).host}</a>}
			</section>
		</>
	);
}
