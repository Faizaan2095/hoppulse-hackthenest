import express from 'express';
import { readState, updateState } from './store.js';
import { checkOrderStatus, receiveCall } from './webhooks.js';
import { normalizeHex } from './bays.js';

const app = express();
const PORT = Number(process.env.API_PORT || 4000);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

function findShop(code) {
  const normalized = normalizeHex(code);
  if (!normalized) return null;
  return readState().shops.find((shop) => shop.shop_hex_code === normalized) || null;
}

// ---- Shop activation (the hex key gate) -----------------------------------

app.get('/api/shops/:code', (req, res) => {
  const shop = findShop(req.params.code);
  if (!shop) return res.status(404).json({ error: 'That shop key is not registered with ShopPulse.' });
  res.json({ shop });
});

// ---- Call log -------------------------------------------------------------

app.get('/api/shops/:code/calls', (req, res) => {
  const shop = findShop(req.params.code);
  if (!shop) return res.status(404).json({ error: 'That shop key is not registered with ShopPulse.' });

  const calls = readState()
    .calls.filter((call) => call.shop_hex_code === shop.shop_hex_code)
    .sort((a, b) => b.created_date.localeCompare(a.created_date))
    .slice(0, 100);

  res.json({ calls });
});

function withCall(code, id, mutate) {
  const shopCode = normalizeHex(code);
  return updateState((state) => {
    const call = state.calls.find((item) => item.id === id && item.shop_hex_code === shopCode);
    if (!call) return null;
    mutate(call);
    return call;
  });
}

app.patch('/api/shops/:code/calls/:id', (req, res) => {
  const body = req.body ?? {};
  if (body.is_done === undefined) return res.status(400).json({ error: 'Nothing to update.' });

  const call = withCall(req.params.code, req.params.id, (record) => {
    record.is_done = Boolean(body.is_done);
  });

  if (!call) return res.status(404).json({ error: 'Call not found for this shop.' });
  res.json({ call });
});

// Picking up keeps the job + revenue but forgets the customer.
app.post('/api/shops/:code/calls/:id/pickup', (req, res) => {
  const call = withCall(req.params.code, req.params.id, (record) => {
    record.picked_up = true;
    record.caller_name = 'Picked Up';
    record.phone = '';
    record.appointment_time = '';
    record.summary = '';
    record.transcript = '';
  });

  if (!call) return res.status(404).json({ error: 'Call not found for this shop.' });
  res.json({ call });
});

// ---- Webhooks --------------------------------------------------------------

app.all('/api/receive-call', receiveCall);
app.all('/api/check-order-status', checkOrderStatus);

// ---- Help metadata for the docs tab ---------------------------------------

app.get('/api/system', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    receive_call_url: `${base}/api/receive-call`,
    check_status_url: `${base}/api/check-order-status`,
    secret_header: 'x-webhook-secret',
  });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShopPulse API listening on http://0.0.0.0:${PORT}`);
});
