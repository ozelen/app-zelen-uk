# Education module

Owned by the Education agent team. Edit only this folder.

- `module.ts` — id, title, extra SQLite tables, agent persona. Shared tables (goals, metrics, achievements, notifications, sessions, activity) come from `src/worker/module-agent.ts`; do not redefine them.
- Add module-specific tools by extending the generic ones in `src/worker/module-chat.ts` through the registry, not by editing the worker.
- Data sources: none yet; a separate backend may come later.
