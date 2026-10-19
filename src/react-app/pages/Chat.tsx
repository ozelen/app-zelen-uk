import { useState } from "react";
import { Link } from "react-router";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";

export default function Chat({ agent, name, title, back }: { agent: string; name: string; title: string; back?: string }) {
	const a = useAgent({ agent, name });
	const { messages, sendMessage, status, clearHistory } = useAgentChat({ agent: a });
	const [text, setText] = useState("");

	return (
		<div className="chat">
			<header className="row">
				<h1>{back ? <Link to={back} className="plain">‹ {title}</Link> : title}</h1>
				<button className="link" onClick={clearHistory}>Clear</button>
			</header>
			<div className="messages">
				{messages.length === 0 && <p className="muted">Ask, log, or plan. Tools run on your own data.</p>}
				{messages.map((m) => (
					<div key={m.id} className={`msg ${m.role}`}>
						{m.parts.map((p, i) =>
							p.type === "text" ? <span key={i}>{p.text}</span> : p.type.startsWith("tool-") ? <em key={i} className="muted tool">{p.type.slice(5)}</em> : null,
						)}
					</div>
				))}
			</div>
			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					if (!text.trim()) return;
					sendMessage({ text });
					setText("");
				}}
			>
				<input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" autoFocus />
				<button type="submit" disabled={status === "streaming"}>Send</button>
			</form>
		</div>
	);
}
