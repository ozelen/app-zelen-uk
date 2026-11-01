import { signUserToken } from "../../worker/tokens";

// fin.zelen.uk client: Access service token at the edge, a Worker-minted user token behind it.
export async function finFetch(env: Env, email: string, path: string, init: RequestInit = {}, params: Record<string, string | number | undefined> = {}) {
	const url = new URL(path, env.FIN_URL);
	for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
	const headers = new Headers(init.headers);
	headers.set("CF-Access-Client-Id", env.FIN_ACCESS_CLIENT_ID);
	headers.set("CF-Access-Client-Secret", env.FIN_ACCESS_CLIENT_SECRET);
	headers.set("authorization", `Bearer ${await signUserToken(env, email, "fin")}`);
	return fetch(url, { ...init, headers });
}

export async function finJson<T>(env: Env, email: string, path: string, params: Record<string, string | number | undefined> = {}, init: RequestInit = {}): Promise<T> {
	const r = await finFetch(env, email, path, init, params);
	if (!r.ok) throw new Error(`fin ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
	return r.status === 204 ? (undefined as T) : r.json<T>();
}
