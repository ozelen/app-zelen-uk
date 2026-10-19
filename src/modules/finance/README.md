# Finance module

Owned by the Finance agent team. Edit only this folder.

- `module.ts` — id, title, extra SQLite tables, agent persona. Shared tables (goals, metrics, achievements, notifications, sessions, activity) come from `src/worker/module-agent.ts`; do not redefine them.
- Add module-specific tools by extending the generic ones in `src/worker/module-chat.ts` through the registry, not by editing the worker.
- Data sources: fin.zelen.uk (Django) is the ledger of record; sync into `transactions` and `bills`.
