# Contributing

## Branches and commits

- Work on a branch; `main` stays deployable.
- Commit messages follow Conventional Commits: `feat(log): add bay column`,
  `fix(webhook): reject unknown shop keys`, `docs: describe pickup semantics`.
- Keep a commit to one concern, and say in the body *why* when the reason is not obvious from the
  diff.

## Project conventions

- **Business rules live on the server.** Bay assignment, status fallback, phone matching and pickup
  anonymization all live in `server/`. The UI displays what the API returns; it does not re-derive it.
- **Scope every query by shop.** Any route that touches a call filters on the normalized
  `shop_hex_code` first. A route that does not is a tenancy bug.
- **New UI goes in its own component** under `src/components/`; `src/pages/Dashboard.jsx` owns state
  and composition only.
- **Style with the existing sheet.** `src/app.css` is the compiled design system — reuse its classes
  and tokens rather than adding a new styling approach.
- **Never commit** `data/state.json`, `node_modules`, build output, or a real webhook secret.

## Before opening a pull request

1. `npm run dev` and walk the flow you changed: activation, live log, the row action, the tab.
2. `npm run build` — the production build must pass.
3. Hit the endpoints you touched with `curl` (see [Development](docs/DEVELOPMENT.md)).
4. Describe what changed, why, and how you checked it. Call out anything you could not verify.

## Documentation

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) explains the process model, data store and call
lifecycle. [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) covers running, resetting and debugging the
app. Update them in the same pull request as the behavior they describe.
