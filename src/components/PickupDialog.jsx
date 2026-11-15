import { AlertTriangle } from 'lucide-react';
import { money } from '../lib/format.js';

export default function PickupDialog({ call, onCancel, onConfirm }) {
  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <h2 className="font-display text-[16px] font-semibold tracking-[-0.01em] text-white">
              Mark as picked up?
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
              This permanently clears {call.caller_name || 'the customer'}&apos;s name, phone number, appointment,
              AI summary and transcript. The job and its {money(call.estimated_value)} stay in your log and in
              revenue totals. This cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-[12.5px] font-medium text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-emerald-400 px-4 py-2.5 text-[12.5px] font-semibold text-[#04140d] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_10px_30px_-8px_hsl(158_76%_46%/0.7)]"
          >
            Picked Up — Clear Details
          </button>
        </div>
      </div>
    </div>
  );
}
