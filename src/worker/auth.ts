import { verifyWithJwks } from "hono/jwt";

export type Identity = { email: string; id: string };

// Cloudflare Access sits in front of app.zelen.uk and sets this header / cookie.
// With ACCESS_TEAM_DOMAIN unset (local dev) everyone is the dev user.
export async function identify(request: Request, env: Env): Promise<Identity | null> {
	if (!env.ACCESS_TEAM_DOMAIN) return { email: "dev@localhost", id: "dev" };
	const token =
		request.headers.get("Cf-Access-Jwt-Assertion") ??
		request.headers.get("Cookie")?.match(/CF_Authorization=([^;]+)/)?.[1];
	if (!token) return null;
	try {
		const payload = await verifyWithJwks(token, {
			jwks_uri: `https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`,
		});
		const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
		if (!aud.includes(env.ACCESS_AUD)) return null;
		const email = String(payload.email ?? "");
		return email ? { email, id: email.toLowerCase() } : null;
	} catch {
		return null;
	}
}
