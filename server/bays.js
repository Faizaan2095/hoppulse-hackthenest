export const STATUSES = ['Booked', 'Urgent Tow', 'Quote Given', 'Waitlist / Reschedule Needed'];

/** "4a9f", "0x4a9f", " 0X4A9F " -> "0x4A9F". Returns null when it is not a 4-digit hex code. */
export function normalizeHex(code) {
  if (typeof code !== 'string') return null;
  const raw = code.trim().toUpperCase().replace(/^0X/, '');
  return /^[0-9A-F]{4}$/.test(raw) ? `0x${raw}` : null;
}

/** Phone comparison ignores formatting and country code: last 10 digits. */
export function digits(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\D/g, '').slice(-10);
}

/**
 * Assign a bay to an incoming job.
 * Scheduled work fills Bay 1 then Bay 2, walk-ins and tow-ins take the overflow bay.
 * Returns null when both scheduled bays are already taken for that appointment.
 */
export function assignBay(existingCalls, appointmentTime, status) {
  if (status === 'Urgent Tow' || !appointmentTime) return 'Walk-In Overflow';

  const taken = new Set(
    existingCalls
      .filter((call) => !call.picked_up && call.appointment_time === appointmentTime)
      .map((call) => call.bay_number),
  );

  for (const bay of ['Bay 1', 'Bay 2']) {
    if (!taken.has(bay)) return bay;
  }
  return null;
}

/** Trim to a max length; non-strings become ''. */
export function clean(value, maxLength) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, maxLength);
}
