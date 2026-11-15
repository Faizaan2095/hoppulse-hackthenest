import { Wrench } from 'lucide-react';

const STATUS_STYLE = {
  Booked: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  'Urgent Tow': 'border-rose-400/25 bg-rose-400/10 text-rose-300',
  'Quote Given': 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  'Waitlist / Reschedule Needed': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
};

const STATUS_DOT = {
  Booked: 'bg-emerald-400',
  'Urgent Tow': 'bg-rose-400',
  'Quote Given': 'bg-sky-400',
  'Waitlist / Reschedule Needed': 'bg-amber-400',
};

export function StatusPill({ status }) {
  const value = status || 'Booked';
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${
        STATUS_STYLE[value] || 'border-white/15 bg-white/5 text-white/70'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[value] || 'bg-white/50'}`} />
      {value}
    </span>
  );
}

const BAY_STYLE = {
  'Bay 1': 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  'Bay 2': 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  'Walk-In Overflow': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
};

export function BayPill({ call }) {
  const overflow = call?.status === 'Waitlist / Reschedule Needed' || call?.status === 'Urgent Tow';
  const bay = call?.bay_number || (overflow ? 'Walk-In Overflow' : '') || 'Unassigned';

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${
        BAY_STYLE[bay] || 'border-white/12 bg-white/[0.04] text-white/40'
      }`}
    >
      {bay === 'Walk-In Overflow' ? <Wrench className="h-3 w-3" /> : null}
      {bay}
    </span>
  );
}
