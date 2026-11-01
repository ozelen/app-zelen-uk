import { sign } from "hono/jwt";

// Tokens the Worker mints for its users when calling the Django backends on their behalf.
// ES256; the backends verify with the public key (fin: APP_JWT_PUBLIC_KEY). See ADR 0005.
export const ISSUER = "https://app.zelen.uk";

const privateJwk = (env: Env) => JSON.parse(env.APP_JWT_PRIVATE_JWK) as JsonWebKey & { kid: string };

export async function signUserToken(env: Env, email: string, aud: string) {
	const jwk = privateJwk(env);
	const now = Math.floor(Date.now() / 1000);
	return sign({ iss: ISSUER, aud, sub: email, email, iat: now, exp: now + 300, kid: jwk.kid }, jwk, "ES256");
}

export function jwks(env: Env) {
	const { d: _d, key_ops: _k, ...pub } = privateJwk(env);
	return { keys: [pub] };
}
