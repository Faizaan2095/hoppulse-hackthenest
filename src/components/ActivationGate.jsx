import { useState } from 'react';
import { AlertTriangle, ArrowRight, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.js';

export default function ActivationGate({ onActivate }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { shop } = await api.shop(code.trim());
      onActivate(shop);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[130px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Unauthorized / Unactivated Terminal
          </span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />
        </div>

        <h1 className="mt-6 font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
          ShopPulse Enterprise Terminal
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/45">
          Enter your assigned hexadecimal shop key to activate.
        </p>

        <form className="mt-6 space-y-3" onSubmit={submit}>
          <div>
            <label
              htmlFor="activation-hex"
              className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40"
            >
              Hexadecimal Shop Key
            </label>
            <input
              id="activation-hex"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError('');
              }}
              placeholder="0xXXXX"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className="h-12 w-full rounded-xl border border-white/12 bg-black px-3 font-mono text-[17px] uppercase tracking-[0.22em] text-emerald-200 placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40"
            />
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
              <p className="text-[12px] leading-snug text-rose-200">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-[13px] font-semibold text-[#04140d] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_12px_34px_-12px_hsl(158_76%_46%/0.8)] disabled:opacity-50 disabled:hover:shadow-none"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying key…
              </>
            ) : (
              <>
                Activate Shop Terminal <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
          <p className="text-[11.5px] leading-relaxed text-white/40">
            No active tenant key detected. Contact ShopPulse provisioning to receive your hardware/voice hex key.
          </p>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/20">
          <ShieldCheck className="h-3 w-3" /> Call data stays sealed until a registered key is verified
        </p>
      </div>
    </div>
  );
}
