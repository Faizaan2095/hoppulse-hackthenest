# ShopPulse — AI Receptionist Command Center

The merchant dashboard for ShopPulse: a voice agent answers the phone, posts the call to a webhook,
and the call lands on the shop's terminal as a job with a bay, a status and a dollar value.

This repository is a working local clone of the ShopPulse app (shop-key terminal, live call log with
**Done / Ready** and **Picked Up**, performance charts, help reference) running on Node + React
instead of the hosted Base44 runtime.

## What is in here

| Path | What it is |
| --- | --- |
| `server/` | Express API — shop keys, call log, webhooks (`receive-call`, `check-order-status`) |
| `src/` | React app (Vite) — the terminal UI, call log, drawer, performance, help |
| `src/app.css` | Compiled design system (Tailwind output, DM Sans, emerald-on-black theme) |
| `data/state.json` | App data — created on first boot, delete it to reseed the demo shops |

## Documentation

| Document | Read it for |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Process topology, request and webhook flow, JSON store, tenancy, limitations |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Running locally and in Docker, env vars, resetting data, API examples, troubleshooting |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Commit convention, project conventions, pre-PR checks |
| [`CHANGELOG.md`](CHANGELOG.md) | What has changed and what the app currently does |

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Open <http://localhost:3000>. One service runs two processes:

- **Vite dev server** on host port 3000 (the preview entry point), proxying `/api` to the API so the
  browser only ever talks to a single origin.
- **Express API** on port 4000, inside the container only.

Data lives in the `shop_data` volume (`/workspace/data`), so restarts keep the call log.
`down -v` wipes it. Without Docker: `npm install && npm run dev`.

## Shop keys

Every business is a tenant with a hexadecimal shop key. The terminal stays sealed until a registered
key is verified; keys are case-insensitive (`4a9f`, `0x4a9f`, `0X4A9F` → `0x4A9F`).

| Key | Shop |
| --- | --- |
| `0x4A9F` | Ypsi Auto Care |
| `0x7B2E` | Campus Cuts & Style |
| `0x8C3D` | Hearth & Crumb Bakery |

## The live call log

Newest first, refreshing every 5 seconds while **Auto-Refresh (Live Sync)** is on, at most 100 rows.
Click any row for the full AI summary and transcript. Columns: Done / Ready, Picked Up, Time, Caller,
Phone, Vehicle / Service, Appointment, Bay, Est. Value, Status.

- **Done / Ready** — the job is finished and waiting for the customer. Saves immediately.
- **Picked Up** — asks once, then permanently clears the customer's name, phone, appointment, AI
  summary and transcript. The job, its value and its revenue stay in the log and in the totals; the
  row fades to “Picked Up”. It cannot be undone, and status lookups by that phone or name no longer
  match the record.

Statuses: `Booked`, `Urgent Tow`, `Quote Given`, `Waitlist / Reschedule Needed`.
Bays: `Bay 1` and `Bay 2` fill first for an appointment time, walk-ins and tow-ins take
`Walk-In Overflow`. If both bays are taken, the job is saved as `Waitlist / Reschedule Needed` with a
follow-up note in the summary.

## Webhooks

Both endpoints take `POST` + `Content-Type: application/json`, require the header
`x-webhook-secret`, answer `OPTIONS` with `200` and CORS headers, and return `405` for any other
method and `401` for a bad secret. The secret is `WEBHOOK_SECRET` in the environment and defaults to
`shoppulse_live_9823` — rotate it before production and update Make.com and the voice agent.

### `POST /api/receive-call`

```bash
curl -X POST http://localhost:3000/api/receive-call \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: shoppulse_live_9823" \
  -d '{
    "shop_hex_code": "0x4A9F",
    "caller_name": "Ray Mitchell",
    "phone": "(567) 461-9381",
    "vehicle_issue": "2014 Honda Civic — front brake pads",
    "appointment_time": "Today, 11:00 AM",
    "estimated_value": 65,
    "status": "Booked",
    "summary": "Grinding under braking; customer approved the quote.",
    "transcript": "AI: Thanks for calling ... Caller: my brakes grind ..."
  }'
```

`200` → `{ "success": true, "call_id": "…", "shop_hex_code": "0x4A9F", "bay_number": "Bay 1", "status": "Booked" }`.
Unknown shop key → `404`, paused webhook → `403`, missing `shop_hex_code` → `400`. An invalid
`estimated_value` becomes `0`; an unknown `status` falls back to `Booked`.

### `POST /api/check-order-status`

```bash
curl -X POST http://localhost:3000/api/check-order-status \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: shoppulse_live_9823" \
  -d '{ "shop_hex_code": "0x4A9F", "phone": "5674619381" }'
```

The shop is filtered first (tenant isolation), then the newest record in that shop is matched by the
last ten phone digits or, without a phone, by a case-insensitive caller-name match:

```json
{ "found": true, "is_done": true, "caller_name": "Ray", "item_or_service": "2014 Honda Civic — front brake pads", "pickup_time": "Ready now — pick up anytime before 6:00 PM" }
{ "found": true, "is_done": false, "caller_name": "Ray", "item_or_service": "2014 Honda Civic — front brake pads", "estimated_time": "Today, 11:00 AM" }
{ "found": false }
```

## Data model

`server/store.js` keeps one JSON document:

- `shops` — `shop_hex_code`, `shop_name`, `industry`, `address`, `phone_number`, `voice`, `webhook_active`
- `calls` — `shop_hex_code`, `caller_name`, `phone`, `vehicle_issue`, `appointment_time`, `bay_number`,
  `status`, `estimated_value`, `summary`, `transcript`, `is_done`, `pickup_window`, `picked_up`,
  `created_date`

## Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `WEBHOOK_SECRET` | `shoppulse_live_9823` | Shared secret for both webhooks |
| `API_PORT` | `4000` | Internal API port (Vite proxies to it) |
| `DATA_FILE` | `./data/state.json` | Where the JSON state lives |

## Integrations

The voice agent (Vapi + ElevenLabs) and SMS (Twilio via Make.com) are external. Point the Make.com
HTTP module at this app's `/api/receive-call` and send `x-webhook-secret`. The Help tab in the app
carries the same reference, including the live URLs.
