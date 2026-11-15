import { randomUUID } from 'node:crypto';
import { readState, updateState } from './store.js';
import { STATUSES, assignBay, clean, digits, normalizeHex } from './bays.js';

// Shared webhook credential. Override with WEBHOOK_SECRET before production use.
const SECRET = process.env.WEBHOOK_SECRET || 'shoppulse_live_9823';

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-webhook-secret');
}

function rejectMethod(res, req) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    return true;
  }
  return false;
}

/**
 * POST /api/receive-call
 * Voice-agent / Make.com webhook that turns a finished call into a job record.
 */
export function receiveCall(req, res) {
  setCors(res);
  if (rejectMethod(res, req)) return;

  if (req.get('x-webhook-secret') !== SECRET) {
    return res.status(401).json({ success: false, error: 'Invalid webhook secret.' });
  }

  const body = req.body ?? {};
  const code = normalizeHex(body.shop_hex_code);
  if (!code) {
    return res.status(400).json({ success: false, error: 'shop_hex_code must be a 4-digit code like 0x4A9F.' });
  }

  const state = readState();
  const shop = state.shops.find((item) => item.shop_hex_code === code);
  if (!shop) return res.status(404).json({ success: false, error: `No shop registered for ${code}.` });
  if (!shop.webhook_active) {
    return res.status(403).json({ success: false, error: 'Inbound calls are paused for this shop.' });
  }

  const status = STATUSES.includes(body.status) ? body.status : 'Booked';
  const appointmentTime = clean(body.appointment_time, 60);
  const estimatedValue = Math.max(0, Number(body.estimated_value) || 0);

  const shopCalls = state.calls.filter((call) => call.shop_hex_code === code);
  let bay = assignBay(shopCalls, appointmentTime, status);
  let finalStatus = status;
  let summary = clean(body.summary, 600);

  if (!bay) {
    bay = 'Walk-In Overflow';
    finalStatus = 'Waitlist / Reschedule Needed';
    summary = `${summary}\n\n⚠️ All bays were full at booking time — staff follow-up needed.`.trim();
  }

  const call = {
    id: randomUUID(),
    shop_hex_code: code,
    caller_name: clean(body.caller_name, 80) || 'Unknown Caller',
    phone: clean(body.phone, 40),
    vehicle_issue: clean(body.vehicle_issue, 160),
    appointment_time: appointmentTime,
    bay_number: bay,
    status: finalStatus,
    estimated_value: estimatedValue,
    summary,
    transcript: clean(body.transcript, 4000),
    is_done: false,
    pickup_window: '',
    picked_up: false,
    created_date: new Date().toISOString(),
  };

  updateState((draft) => {
    draft.calls.push(call);
  });

  res.status(200).json({
    success: true,
    call_id: call.id,
    shop_hex_code: code,
    shop_name: shop.shop_name,
    bay_number: bay,
    status: finalStatus,
  });
}

/**
 * POST /api/check-order-status
 * "Is my order ready?" lookup, always scoped to one shop first.
 */
export function checkOrderStatus(req, res) {
  setCors(res);
  if (rejectMethod(res, req)) return;

  if (req.get('x-webhook-secret') !== SECRET) {
    return res.status(401).json({ success: false, error: 'Invalid webhook secret.' });
  }

  const body = req.body ?? {};
  const code = normalizeHex(body.shop_hex_code);
  if (!code) {
    return res.status(400).json({ success: false, error: 'shop_hex_code must be a 4-digit code like 0x4A9F.' });
  }

  const shop = readState().shops.find((item) => item.shop_hex_code === code);
  if (!shop) return res.status(404).json({ success: false, error: `No shop registered for ${code}.` });

  const phone = digits(body.phone);
  const name = clean(body.caller_name, 80).toLowerCase();
  if (phone.length < 7 && !name) {
    return res.status(400).json({ success: false, error: 'Send a caller_name or a phone number with at least 7 digits.' });
  }

  // Shop isolation first, then narrow: newest 200 records of THIS shop only.
  const candidates = readState()
    .calls.filter((call) => call.shop_hex_code === code)
    .sort((a, b) => b.created_date.localeCompare(a.created_date))
    .slice(0, 200);

  const match = phone.length >= 7
    ? candidates.find((call) => call.phone && digits(call.phone) === phone)
    : candidates.find((call) => call.caller_name.toLowerCase().includes(name));

  if (!match) return res.status(200).json({ found: false });

  if (match.is_done) {
    return res.status(200).json({
      found: true,
      is_done: true,
      caller_name: match.caller_name,
      item_or_service: match.vehicle_issue,
      pickup_time: match.pickup_window || 'Ready for pickup',
    });
  }

  return res.status(200).json({
    found: true,
    is_done: false,
    caller_name: match.caller_name,
    item_or_service: match.vehicle_issue,
    estimated_time: match.appointment_time || 'Not scheduled yet',
  });
}
