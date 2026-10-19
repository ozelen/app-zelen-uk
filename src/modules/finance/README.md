# Finance module

Owned by the Finance agent team. Edit only this folder.

- `module.ts` — id, title, extra SQLite tables, agent persona. Shared tables (goals, metrics, achievements, notifications, sessions, activity) come from `src/worker/module-agent.ts`; do not redefine them.
- Add module-specific tools by extending the generic ones in `src/worker/module-chat.ts` through the registry, not by editing the worker.
- Data sources: fin.zelen.uk (Django) is the ledger of record; sync into `transactions` and `bills`.

## Tools

`tools.ts` → `fin_totals`, `fin_transactions` (mirrors rows into `transactions` as `fin:<id>`), `fin_forecast`. `fin.ts` holds the client: Access service token + fin JWT login. Secrets: `FIN_ACCESS_CLIENT_ID`, `FIN_ACCESS_CLIENT_SECRET`, `FIN_USERNAME`, `FIN_PASSWORD`; var `FIN_URL`.
