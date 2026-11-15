import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

// Whole app state lives in one JSON document. Delete data/state.json to reseed.
const DATA_FILE = process.env.DATA_FILE || join(process.cwd(), 'data', 'state.json');

const hoursAgo = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();

function seed() {
  const shops = [
    {
      shop_hex_code: '0x4A9F',
      shop_name: 'Ypsi Auto Care',
      industry: 'Auto repair',
      address: '1201 Washtenaw Ave, Ypsilanti, MI 48197',
      phone_number: '(734) 555-0142',
      voice: 'Ava',
      webhook_active: true,
    },
    {
      shop_hex_code: '0x7B2E',
      shop_name: 'Campus Cuts & Style',
      industry: 'Salon',
      address: '312 Cross St, Ypsilanti, MI 48198',
      phone_number: '(734) 555-0188',
      voice: 'Nova',
      webhook_active: true,
    },
    {
      shop_hex_code: '0x8C3D',
      shop_name: 'Hearth & Crumb Bakery',
      industry: 'Bakery',
      address: '18 W Michigan Ave, Ypsilanti, MI 48197',
      phone_number: '(734) 555-0110',
      voice: 'Iris',
      webhook_active: true,
    },
  ];

  const calls = [
    {
      id: randomUUID(),
      shop_hex_code: '0x4A9F',
      caller_name: 'Jonathan Reyes',
      phone: '(734) 555-0193',
      vehicle_issue: '2019 Jeep Cherokee — overheating on the highway',
      appointment_time: 'Today, 2:30 PM',
      bay_number: 'Bay 1',
      status: 'Urgent Tow',
      estimated_value: 480,
      summary:
        'Called stranded on I-94. Tow is rolling in now; needs a coolant leak diagnosis before closing.',
      transcript:
        'AI: Thanks for calling Ypsi Auto Care, how can I help? Caller: my temp gauge is pinned and I am pulled over on I-94 ...',
      is_done: false,
      pickup_window: '',
      picked_up: false,
      created_date: hoursAgo(0.4),
    },
    {
      id: randomUUID(),
      shop_hex_code: '0x4A9F',
      caller_name: 'Ray Mitchell',
      phone: '(567) 461-9381',
      vehicle_issue: '2014 Honda Civic — front brake pads and rotors',
      appointment_time: 'Today, 11:00 AM',
      bay_number: 'Bay 2',
      status: 'Booked',
      estimated_value: 65,
      summary: 'Grinding under braking. Quoted pads and rotors, customer approved the diagnostic fee.',
      transcript:
        'AI: How can I help today? Caller: brakes are grinding bad, can you get me in? AI: I have 11am open ...',
      is_done: true,
      pickup_window: 'Ready now — pick up anytime before 6:00 PM',
      picked_up: false,
      created_date: hoursAgo(5),
    },
    {
      id: randomUUID(),
      shop_hex_code: '0x4A9F',
      caller_name: 'Marta Okafor',
      phone: '(734) 555-0121',
      vehicle_issue: '2021 Subaru Outback — winter tire swap',
      appointment_time: '',
      bay_number: 'Walk-In Overflow',
      status: 'Quote Given',
      estimated_value: 120,
      summary: 'Walked in for a tire swap quote. Waiting on a callback to confirm the appointment.',
      transcript: 'AI: Ypsi Auto Care, what can I do for you? Caller: how much for a winter tire swap?',
      is_done: false,
      pickup_window: '',
      picked_up: false,
      created_date: hoursAgo(22),
    },
    {
      id: randomUUID(),
      shop_hex_code: '0x4A9F',
      caller_name: 'Picked Up',
      phone: '',
      vehicle_issue: '2016 Ford Focus — wheel alignment',
      appointment_time: '',
      bay_number: 'Walk-In Overflow',
      status: 'Booked',
      estimated_value: 210,
      summary: '',
      transcript: '',
      is_done: true,
      pickup_window: '',
      picked_up: true,
      created_date: hoursAgo(30),
    },
    {
      id: randomUUID(),
      shop_hex_code: '0x7B2E',
      caller_name: 'Dana Whitfield',
      phone: '(734) 555-0177',
      vehicle_issue: 'Balayage + trim',
      appointment_time: 'Tomorrow, 10:00 AM',
      bay_number: 'Bay 1',
      status: 'Booked',
      estimated_value: 165,
      summary: 'Wants a consult first. Allergic to ammonia-based color.',
      transcript: 'AI: Campus Cuts, how can I help? Caller: I need a color appointment ...',
      is_done: false,
      pickup_window: '',
      picked_up: false,
      created_date: hoursAgo(9),
    },
    {
      id: randomUUID(),
      shop_hex_code: '0x8C3D',
      caller_name: 'Marta Okafor',
      phone: '(734) 555-0121',
      vehicle_issue: 'Custom birthday cake — 12 inch, vanilla',
      appointment_time: 'Saturday, 9:00 AM',
      bay_number: 'Bay 1',
      status: 'Booked',
      estimated_value: 78,
      summary: 'Needs pickup before 10am. Writing on the cake: "Happy 8th, Theo".',
      transcript: 'AI: Hearth & Crumb, what can I get started? Caller: a birthday cake ...',
      is_done: false,
      pickup_window: '',
      picked_up: false,
      created_date: hoursAgo(20),
    },
  ];

  return { shops, calls };
}

function ensureFile() {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seed(), null, 2));
  }
}

export function readState() {
  ensureFile();
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    const fresh = seed();
    writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

export function writeState(state) {
  ensureFile();
  const tmp = `${DATA_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, DATA_FILE);
  return state;
}

/** Read, mutate and persist in one step. */
export function updateState(mutator) {
  const state = readState();
  const result = mutator(state);
  writeState(state);
  return result === undefined ? state : result;
}
