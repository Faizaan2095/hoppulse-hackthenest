import { X } from 'lucide-react';
import { BayPill, StatusPill } from './pills.jsx';
import { clockDay, money } from '../lib/format.js';

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">{label}</p>
      <p className={`mt-1 text-[13px] text-white/80 ${mono ? 'font-mono tabular-nums' : ''}`}>{value || '—'}</p>
    </div>
  );
}

export default function CallDetailDrawer({ call, onClose }) {
  if (!call) return null;
  const time = clockDay(call.created_date);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="sp-scroll absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-card px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/35">Call record</p>
            <h2 className="mt-1 font-display text-[19px] font-semibold tracking-[-0.02em] text-white">
              {call.caller_name || 'Unknown Caller'}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-white/40">
              {time.day} · {time.clock}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close call details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/50 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status={call.status} />
          <BayPill call={call} />
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/60">
            {money(call.estimated_value)}
          </span>
          {call.is_done ? (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Ready for pickup
            </span>
          ) : null}
          {call.picked_up ? (
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/40">
              Picked up · details cleared
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Phone" value={call.phone} mono />
          <Field label="Appointment" value={call.appointment_time} />
          <div className="col-span-2">
            <Field label="Vehicle / Service" value={call.vehicle_issue} />
          </div>
          {call.pickup_window ? (
            <div className="col-span-2">
              <Field label="Pickup message" value={call.pickup_window} />
            </div>
          ) : null}
        </div>

        {call.picked_up ? (
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
            <p className="text-[11.5px] leading-relaxed text-white/40">
              This customer collected their job. Their name, phone, appointment, summary and transcript were
              permanently cleared — the job and its {money(call.estimated_value)} stay in the log and in revenue.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">AI summary</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">
                {call.summary || 'No summary captured on this call.'}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Transcript</p>
              <div className="sp-scroll mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-white/[0.07] bg-black p-3">
                <p className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-white/55">
                  {call.transcript || 'No transcript stored for this call.'}
                </p>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
