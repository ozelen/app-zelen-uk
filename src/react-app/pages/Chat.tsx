import { useState } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import type { Me } from "../App";

export default function Chat({ me }: { me: Me }) {
	const agent = useAgent({ agent: "assistant", name: me.id });
	const { messages, sendMessage, status, clearHistory } = useAgentChat({ agent });
	const [text, setText] = useState("");

	return (
		<div className="chat">
			<header className="row">
				<h1>Assistant</h1>
				<button className="link" onClick={clearHistory}>Clear</button>
			</header>
			<div className="messages">
				{messages.length === 0 && <p className="muted">Ask about money, meals, a job round, or what to do today.</p>}
				{messages.map((m) => (
					<div key={m.id} className={`msg ${m.role}`}>
						{m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
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
