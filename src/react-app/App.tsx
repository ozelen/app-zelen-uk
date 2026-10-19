import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ModulePage from "./pages/ModulePage";

export type Me = { email: string; id: string };

export default function App() {
	const [me, setMe] = useState<Me | null | undefined>();
	useEffect(() => {
		fetch("/api/me").then(async (r) => setMe(r.ok ? await r.json() : null));
	}, []);

	if (me === undefined) return <main className="center">…</main>;
	if (me === null)
		return (
			<main className="center">
				<h1>app.zelen.uk</h1>
				<p>Sign in is handled by Cloudflare Access.</p>
				<a className="button" href="/">Sign in</a>
			</main>
		);

	return (
		<>
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/chat" element={<Chat agent="assistant" name={me.id} title="Assistant" />} />
					<Route path="/profile" element={<Profile me={me} />} />
					<Route path="/:module" element={<ModulePage />} />
					<Route path="/:module/chat/:session" element={<ModuleChatRoute me={me} />} />
				</Routes>
			</main>
			<nav className="tabs">
				<NavLink to="/" end>Home</NavLink>
				<NavLink to="/chat">Chat</NavLink>
				<NavLink to="/profile">Profile</NavLink>
			</nav>
		</>
	);
}

import { useParams } from "react-router";
import { MODULES } from "../modules";
function ModuleChatRoute({ me }: { me: Me }) {
	const { module, session } = useParams();
	const def = MODULES.find((m) => m.id === module);
	if (!def || !session) return <p>Not found.</p>;
	return <Chat agent="module-chat" name={`${def.id}:${me.id}:${session}`} title={def.title} back={`/${def.id}`} />;
}
