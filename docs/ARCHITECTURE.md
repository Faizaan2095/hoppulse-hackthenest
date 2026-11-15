# Architecture

ShopPulse is a two-process Node application plus a single JSON data file. There is no external
service to run: the whole app is the browser UI, an Express API, and `data/state.json`.

## Runtime topology

```
browser ──► host :3000 ──► Vite dev server ──/api──► Express :4000 ──► data/state.json
                                  │
                                  └── serves the React app (src/)
```

- **Vite** (`vite.config.js`) listens on `0.0.0.0:3000` and is the only public port. It serves the
  React app and proxies every `/api/*` request to the API on `127.0.0.1:4000`, so the browser only
  ever talks to one origin — no CORS, no cookies across hosts.
- **Express** (`server/index.js`) listens on `0.0.0.0:4000` and owns all reads and writes.
- Both processes start from one command (`npm run dev`), and the container mounts the repository at
  `/workspace` so source edits are live.

Vite's own CORS middleware is disabled on purpose: the webhooks answer their own `OPTIONS` request,
and Vite would otherwise short-circuit it with a bare `204`.

## Request lifecycle

**Activation.** The terminal is sealed until a shop key is entered. `ActivationGate` stores the key in
`localStorage` (`src/lib/session.js`) and the dashboard then calls
`GET /api/shops/:code`. The key is normalized server-side (`normalizeHex` in `server/bays.js`) to
`0x` + four upper-case hex digits, so `4a9f`, `0x4a9f` and ` 0X4A9F ` all resolve to `0x4A9F`.

**Live sync.** While **Auto-Refresh (Live Sync)** is on, the call log re-reads
`GET /api/shops/:code/calls` every 5 seconds. The route filters by shop, sorts newest first, and
returns at most 100 rows.

**Done / Ready** is `PATCH /api/shops/:code/calls/:id` with `{ is_done: true | false }`.

**Picked Up** is `POST /api/shops/:code/calls/:id/pickup`. It sets `picked_up` and overwrites the
customer fields (name, phone, appointment, summary, transcript) with empty values. The job, its bay,
its status and its value stay in the log and in the revenue totals so reporting survives the
customer's departure. This is intentionally irreversible.

## Webhook flow

The voice agent posts a finished call to `/api/receive-call`:

1. `x-webhook-secret` is compared against `WEBHOOK_SECRET` (`401` on mismatch).
2. `shop_hex_code` is normalized and looked up (`404` if unknown, `403` if the shop's webhook is
   paused).
3. `assignBay` (`server/bays.js`) picks `Bay 1`, then `Bay 2` for scheduled work; walk-ins and
   tow-ins take `Walk-In Overflow`. Both bays taken and no appointment → the job is saved as
   `Waitlist / Reschedule Needed` with a follow-up note.
4. The record is appended and the response reports `call_id`, `bay_number` and final `status`.

`/api/check-order-status` is the read side used by the phone agent: the shop is filtered first, then
the newest record in that shop is matched by the last ten phone digits (or caller name when no phone
is supplied), and the reply tells the caller whether the job is ready.

Both endpoints are mounted with `app.all`, accept `OPTIONS` with CORS headers, and answer `405` for
other methods.

## Data store

`server/store.js` keeps one document:

```json
{ "shops": [ ... ], "calls": [ ... ] }
```

- On first boot the file is created from `seed()` — three demo shops and a handful of calls, with
  timestamps relative to boot time so the dashboard always looks live.
- Reads go through `readState()`; a corrupt or missing file is reseeded rather than crashing the API.
- Writes go through `writeState()`, which writes `state.json.tmp` and then `rename`s it over the real
  file, so a crash mid-write cannot truncate the data.
- `updateState(mutator)` wraps read → mutate → write for the call mutations.

The file path is `DATA_FILE`, default `./data/state.json`. In the sandbox that directory is a Docker
volume, so restarts keep the log.

**Trade-off:** a single JSON document is trivial to inspect and to reseed, but there is no locking,
so two processes must never write to it at once (the app runs exactly one API process), and the whole
file is rewritten on every change. It is right for a single-shop demo, not for many concurrent shops.

## Tenancy

Every shop has a four-digit hex key, and every call carries `shop_hex_code`. All API routes and all
webhook lookups scope by that normalized code before touching a record, so one shop can never read or
mutate another's calls. The key is a shop identifier, not a password: it is short, typed by hand, and
stored in plain local storage. There is no user account or server session.

## Frontend structure

| Path | Responsibility |
| --- | --- |
| `src/App.jsx` | Renders the dashboard (single route) |
| `src/pages/Dashboard.jsx` | Shop activation, polling loop, tab switching, drawer state |
| `src/components/ActivationGate.jsx` | The shop-key screen |
| `src/components/CallLogTable.jsx` | The live log, done/pickup controls |
| `src/components/CallDetailDrawer.jsx` | Full summary and transcript |
| `src/components/PickupDialog.jsx` | Irreversible-action confirmation |
| `src/components/KpiStrip.jsx` | Revenue, calls, average ticket |
| `src/components/PerformanceTab.jsx` | Charts (Recharts) |
| `src/components/HelpTab.jsx` | Webhook reference, live URLs from `GET /api/system` |
| `src/lib/api.js` | Thin fetch wrapper for the API |
| `src/lib/session.js` | Shop key in `localStorage` |
| `src/lib/format.js` | Money, clock/day and day-key formatting |

Styling is a single compiled stylesheet (`src/app.css`): dark terminal surfaces, emerald accents,
DM Sans.

## Known limitations

- One shared webhook secret for every shop, sent in a plain header.
- No rate limiting, no request signing, no audit trail.
- Polling for live data instead of server push.
- The JSON store holds no history: a pickup erases the customer fields permanently.
