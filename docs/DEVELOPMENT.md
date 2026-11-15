# Development

## Prerequisites

Node 22 and npm. No database, no external services — everything else is in the repository.

```bash
npm install
```

## Run it

```bash
npm run dev
```

That starts the API (`node server/index.js`, port 4000) and Vite (port 3000) together. Open
<http://localhost:3000>.

| Command | What it does |
| --- | --- |
| `npm run dev` | API + Vite dev server, both with reload |
| `npm run server` | API only (port 4000) |
| `npm run build` | Production build of the React app into `dist/` |
| `npm run preview` | Serve the built bundle |

## Run it in Docker

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml logs -f web
```

The container mounts the repository at `/workspace` and installs dependencies into a named volume, so
source edits reach the app without a rebuild. `node_modules` and `data` are volumes because the
sandbox filesystem is slow and the data must survive restarts.

## Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `WEBHOOK_SECRET` | `shoppulse_live_9823` | Shared secret both webhooks require |
| `API_PORT` | `4000` | Port the Express API listens on |
| `API_URL` | `http://127.0.0.1:4000` | Where Vite proxies `/api` |
| `DATA_FILE` | `./data/state.json` | Location of the JSON state |

Set `WEBHOOK_SECRET` for any environment that is not a local sandbox. The default is a development
value and is visible in this repository.

## Resetting the data

```bash
rm data/state.json        # reseeded on the next request
docker compose -f docker-compose.base44.yml down -v   # wipes the sandbox volume too
```

Deleting the file reseeds the three demo shops and their calls. There is no migration to run.

## Exercise the API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/shops/4a9f
curl http://localhost:3000/api/shops/0x4A9F/calls

curl -X POST http://localhost:3000/api/receive-call \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: shoppulse_live_9823" \
  -d '{"shop_hex_code":"0x4A9F","caller_name":"Test Caller","phone":"(734) 555-0100","vehicle_issue":"2015 Toyota Camry — oil change","appointment_time":"Today, 3:00 PM","estimated_value":60,"status":"Booked"}'
```

Requests go through port 3000 so they exercise the same proxy path the browser uses.

## Checking a change

1. Does the terminal still unlock with `0x4A9F` and show the seeded calls?
2. Does the row you touched still read correctly — done/ready toggle, pickup dialog, drawer?
3. Do `GET /api/shops/0x4A9F/calls` and the Performance tab agree on totals?
4. Any console error in the browser? Any 4xx/5xx in the API log?

## Troubleshooting

- **Port 3000 already in use** — Vite runs with `strictPort`, so it exits instead of moving. Stop the
  other process (`docker compose ... down`, or the stray `node`/`vite`).
- **Edits do not appear** — polling is on (`watch.usePolling`), but a wedged dev server still needs a
  restart: `docker compose -f docker-compose.base44.yml restart web`.
- **`/api` returns 502** — the API process is not up; check the container log for the
  `ShopPulse API listening` line.
- **Log looks empty** — you are on the wrong shop key, or `data/state.json` was seeded for another
  shop. Check the key with `GET /api/shops/:code`.
