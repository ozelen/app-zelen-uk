import { useState } from "react";
import { useAgent } from "agents/react";
import type { Me } from "../App";
import type { AssistantState, Profile as P } from "../../worker/assistant";

const empty: P = { name: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, about: "" };

export default function Profile({ me }: { me: Me }) {
	const [profile, setProfile] = useState<P>(empty);
	const [saved, setSaved] = useState(false);
	const agent = useAgent<AssistantState>({
		agent: "assistant",
		name: me.id,
		// keep the browser timezone until the saved profile has one
		onStateUpdate: (s) => setProfile({ ...empty, ...Object.fromEntries(Object.entries(s.profile).filter(([, v]) => v)) }),
	});
	const set = (k: keyof P) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setProfile({ ...profile, [k]: e.target.value });
		setSaved(false);
	};

	return (
		<>
			<header><h1>Profile</h1><p className="muted">{me.email}</p></header>
			<form
				className="card form"
				onSubmit={(e) => {
					e.preventDefault();
					agent.setState({ profile });
					setSaved(true);
				}}
			>
				<label>Name<input value={profile.name} onChange={set("name")} /></label>
				<label>Timezone<input value={profile.timezone} onChange={set("timezone")} /></label>
				<label>About you<textarea rows={4} value={profile.about} onChange={set("about")} placeholder="Goals, constraints, what the assistant should know" /></label>
				<button type="submit">{saved ? "Saved" : "Save"}</button>
			</form>
		</>
	);
}
