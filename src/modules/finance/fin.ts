// fin.zelen.uk client: Access service token at the edge, fin's own JWT login behind it.
// ponytail: username/password login until task 02 (Worker-signed user tokens) lands in fin.
let cached: { access: string; exp: number } | undefined;

const accessHeaders = (env: Env) => ({
	"CF-Access-Client-Id": env.FIN_ACCESS_CLIENT_ID,
	"CF-Access-Client-Secret": env.FIN_ACCESS_CLIENT_SECRET,
});

async function login(env: Env) {
	const r = await fetch(`${env.FIN_URL}/api/auth/token/`, {
		method: "POST",
		headers: { ...accessHeaders(env), "content-type": "application/json" },
		body: JSON.stringify({ username: env.FIN_USERNAME, password: env.FIN_PASSWORD }),
	});
	if (!r.ok) throw new Error(`fin login failed: ${r.status}`);
	const { access } = await r.json<{ access: string }>();
	cached = { access, exp: Date.now() + 11 * 3600_000 };
	return access;
}

export async function finJson<T>(env: Env, path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
	const url = new URL(path, env.FIN_URL);
	for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
	const call = async (token: string) => fetch(url, { headers: { ...accessHeaders(env), authorization: `Bearer ${token}` } });
	let r = await call(cached && cached.exp > Date.now() ? cached.access : await login(env));
	if (r.status === 401) r = await call(await login(env));
	if (!r.ok) throw new Error(`fin ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
	return r.json<T>();
}
