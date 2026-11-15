import { CheckCircle2, Clock, DollarSign, PhoneCall } from 'lucide-react';
import { money } from '../lib/format.js';

function Kpi({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/60 px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{label}</p>
        <Icon className="h-3.5 w-3.5 text-white/25" />
      </div>
      <p className="mt-1.5 font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-white/35">{note}</p>
    </div>
  );
}

export default function KpiStrip({ calls = [] }) {
  const open = calls.filter((call) => !call.picked_up);
  const ready = calls.filter((call) => call.is_done && !call.picked_up).length;
  const revenue = calls.reduce((sum, call) => sum + (Number(call.estimated_value) || 0), 0);
  const collected = calls
    .filter((call) => call.picked_up)
    .reduce((sum, call) => sum + (Number(call.estimated_value) || 0), 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={PhoneCall} label="Calls logged" value={calls.length} note={`${open.length} still open`} />
      <Kpi icon={CheckCircle2} label="Ready for pickup" value={ready} note="Done / Ready checked" />
      <Kpi icon={DollarSign} label="Est. revenue" value={money(revenue)} note={`${money(collected)} collected`} />
      <Kpi icon={Clock} label="Waiting on reschedule" value={calls.filter((c) => c.status === 'Waitlist / Reschedule Needed').length} note="Bays were full at booking" />
    </div>
  );
}
