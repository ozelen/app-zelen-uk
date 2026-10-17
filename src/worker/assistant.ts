import { AIChatAgent } from "@cloudflare/ai-chat";
import { createAI } from "agents/models/ai-sdk";
import { convertToModelMessages, streamText } from "ai";

export type Profile = { name: string; timezone: string; about: string };
export type AssistantState = { profile: Profile };

// One Assistant per person (instance name = user id). Chat history, profile and
// later habit tables all live in this Durable Object's SQLite.
export class Assistant extends AIChatAgent<Env, AssistantState> {
	initialState: AssistantState = { profile: { name: "", timezone: "", about: "" } };
	maxPersistedMessages = 200;

	async onChatMessage() {
		const { profile } = this.state;
		const ai = createAI({ binding: this.env.AI });
		const result = streamText({
			model: ai(this.env.MODEL),
			system: `You are ${profile.name || "the user"}'s personal assistant for finance, fitness, career and education.
Be direct and concise. Today is ${new Date().toISOString().slice(0, 10)}.
${profile.timezone ? `User timezone: ${profile.timezone}.` : ""}
${profile.about ? `About the user: ${profile.about}` : ""}`,
			messages: await convertToModelMessages(this.messages),
		});
		return result.toUIMessageStreamResponse();
	}
}
