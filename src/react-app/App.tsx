import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Domain from "./pages/Domain";

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
					<Route path="/" element={<Home me={me} />} />
					<Route path="/chat" element={<Chat me={me} />} />
					<Route path="/profile" element={<Profile me={me} />} />
					<Route path="/:domain" element={<Domain />} />
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
