# Career module

Owned by the Career agent team. Edit only this folder. Knowledge space: vault `clients/zelen.uk/job.zelen.uk/`.

- Backend: **job.zelen.uk** (Django + DRF + Postgres on the NAS, repo `ozelen/job-zelen-uk`) is the system of record. This module's SQLite tables are the agent's working copy, like finance's `transactions`.
- `module.ts` — tables `opportunities`, `rounds`, `contacts`, `cvs`, `notes`; persona = condensed Career Advisor Protocol (`career/strategy/Advisor Protocol.md` in the vault). Shared tables come from `src/worker/module-agent.ts`.
- To write: `tools.ts` with `job_*` tools on the finance `fin.ts` pattern (JWT login at `/api/auth/token/`, Access service token). Vars `JOB_URL`; secrets `JOB_ACCESS_CLIENT_ID`, `JOB_ACCESS_CLIENT_SECRET`, `JOB_USERNAME`, `JOB_PASSWORD`.
