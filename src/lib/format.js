export function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

/** { clock: "2:41 PM", day: "Nov 15" } — the two-line Time column. */
export function clockDay(iso) {
  if (!iso) return { clock: '—', day: '—' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { clock: '—', day: '—' };
  return {
    clock: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    day: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
  };
}

export function dayKey(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}
