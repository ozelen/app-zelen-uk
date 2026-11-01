# Education module

Owned by the Education agent team. Edit only this folder. Education gets its own backend later; until then this module keeps its own data.

- `module.ts` — tables `skills`, `courses`, `study_sessions`; persona reads the career gaps. Shared tables come from `src/worker/module-agent.ts`.
- Education goals are the learning path; study sessions are this module's streak contribution.
