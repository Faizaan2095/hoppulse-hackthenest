import { ChevronRight, PhoneMissed } from 'lucide-react';
import Checkbox from './Checkbox.jsx';
import { BayPill, StatusPill } from './pills.jsx';
import { clockDay, money } from '../lib/format.js';

export default function CallLogTable({ calls = [], onSelect, onToggleDone, onMarkPickedUp, loading }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/60">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[15px] font-medium tracking-[-0.01em] text-white">Live AI Call Log</h2>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/50">
            {calls.length}
          </span>
        </div>
        <span className="hidden text-[11px] text-white/35 sm:block">
          Newest first · click a row for the full transcript
        </span>
      </div>

      {calls.length ? (
        <div className="sp-scroll overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.14em] text-white/35">
                <th className="px-5 py-3 font-medium">Done / Ready</th>
                <th className="px-4 py-3 font-medium">Picked Up</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Caller</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Vehicle / Service</th>
                <th className="px-4 py-3 font-medium">Appointment</th>
                <th className="px-4 py-3 font-medium">Bay</th>
                <th className="px-4 py-3 text-right font-medium">Est. Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-8 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const time = clockDay(call.created_date);
                return (
                  <tr
                    key={call.id}
                    onClick={() => onSelect(call.id)}
                    className={`group cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.035] ${
                      call.picked_up ? 'opacity-55' : ''
                    }`}
                  >
                    <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={call.is_done === true}
                        onCheckedChange={() => onToggleDone?.(call)}
                        aria-label={`Mark ${call.caller_name || 'this call'} done / ready`}
                        label={`Mark ${call.caller_name || 'this call'} done / ready`}
                      />
                    </td>
                    <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                      {call.picked_up ? (
                        <span className="text-[11.5px] font-medium text-white/35">Cleared</span>
                      ) : (
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => onMarkPickedUp?.(call)}
                          label={`Mark ${call.caller_name || 'this call'} picked up`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[12.5px] tabular-nums text-white/70">{time.clock}</div>
                      <div className="text-[10.5px] uppercase tracking-[0.1em] text-white/30">{time.day}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[13px] font-medium text-white">{call.caller_name || 'Unknown Caller'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-[11.5px] text-white/45">{call.phone || '—'}</div>
                    </td>
                    <td className="max-w-[260px] px-4 py-4">
                      <div className="truncate text-[12.5px] text-white/70">{call.vehicle_issue || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[12px] text-white/55">{call.appointment_time || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <BayPill call={call} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="tabular-nums text-[13px] font-medium text-white/80">{money(call.estimated_value)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={call.status} />
                    </td>
                    <td className="px-3 py-4">
                      <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-colors group-hover:text-white/50" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <PhoneMissed className="h-7 w-7 text-white/20" />
          <p className="text-[13.5px] font-medium text-white/70">
            {loading ? 'Loading calls…' : 'No calls in this log yet'}
          </p>
          <p className="max-w-sm text-[12px] text-white/35">
            Calls land here the moment your voice agent posts them to the receive-call webhook.
          </p>
        </div>
      )}
    </div>
  );
}
