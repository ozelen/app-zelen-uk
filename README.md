# app.zelen.uk

One web app and one assistant for finance, fitness, career and education. Cloudflare Worker (Hono) + React SPA + Agents SDK. Each person gets one `Assistant` Durable Object (instance name = user id) that holds chat history, profile and, later, habits.

```bash
npm run dev      # http://localhost:5173 — everyone is dev@localhost until ACCESS_* are set
npm run check    # tsc + build + wrangler deploy --dry-run
npm run deploy
```

Login is Cloudflare Access in front of the hostname. The Worker verifies `Cf-Access-Jwt-Assertion` against `ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` (Worker vars) and only lets a user open their own agent. Model is the `MODEL` var, routed through the AI binding (Workers AI or AI Gateway catalog names).

Design notes live in the Knowledge Base under `clients/zelen.uk/app.zelen.uk/`.
