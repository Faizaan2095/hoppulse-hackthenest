# Changelog

Notable changes to ShopPulse. The format follows [Keep a Changelog](https://keepachangelog.com/);
versions track `package.json`.

## Unreleased

### Documentation

- `README.md` rewritten around the running app: layout, shop keys, call log rules, webhook reference,
  data model and environment variables.
- `docs/ARCHITECTURE.md` — process topology, request lifecycle, webhook flow, JSON store, tenancy and
  known limitations.
- `docs/DEVELOPMENT.md` — running locally and in Docker, environment variables, data reset, API
  examples and troubleshooting.
- `CONTRIBUTING.md` — commit convention, project conventions and pre-PR checks.

## 0.1.0

### Added

- Shop-key terminal: a four-digit hex key unlocks the dashboard for one of three demo shops, and the
  key is remembered in local storage.
- Live call log: newest first, 100 rows, 5-second auto-refresh while Live Sync is on, with the
  caller, phone, vehicle or service, appointment, bay, estimated value and status.
- **Done / Ready** toggle that saves immediately, and **Picked Up** which clears the customer's name,
  phone, appointment, AI summary and transcript while keeping the job, bay and revenue.
- Call detail drawer with the full AI summary and transcript.
- KPI strip, performance charts and a help tab that shows the live webhook URLs.
- Express API: shop lookup, call log, done/picked-up mutations, `receive-call` and
  `check-order-status` webhooks behind a shared `x-webhook-secret`, plus a system endpoint for the
  help tab.
- Bay assignment for scheduled, walk-in and tow-in jobs, with waitlist fallback when both bays are
  taken.
- Single-file JSON state store that seeds demo shops on first boot and writes atomically.
- Docker setup that runs the Vite dev server on port 3000 and the API on 4000 inside one container,
  behind Vite's `/api` proxy.
