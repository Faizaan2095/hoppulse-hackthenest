import { Lock, RefreshCw, Radio } from 'lucide-react';

export default function DashboardHeader({ shop, autoRefresh, onAutoRefreshChange, onLockSwitch }) {
  return (
    <header className="relative z-10 flex flex-col gap-5 border-b border-white/[0.07] pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10">
          <Radio className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-black" />
        </div>
        <div>
          <h1 className="font-display text-[19px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[21px]">
            ShopPulse<span className="ml-2 font-normal text-white/40">— AI Receptionist Command Center</span>
          </h1>
          <p className="mt-0.5 text-[12px] text-white/40">
            {shop ? `${shop.shop_name} · ${shop.phone_number || 'voice line pending'}` : 'Connect a shop hex code to load your calls'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3.5 py-2"
          style={{ boxShadow: '0 0 24px -6px hsl(158 76% 46% / 0.55)' }}
        >
          <span
            className="h-2 w-2 rounded-full bg-emerald-400"
            style={{ animation: 'spPulseRing 2.2s ease-out infinite' }}
          />
          <span className="text-[12px] font-medium tracking-wide text-emerald-200">
            ElevenLabs + Vapi Agent: <span className="font-semibold text-emerald-300">LIVE</span>
          </span>
        </div>

        <label
          htmlFor="auto-refresh"
          className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 transition-colors hover:border-white/20"
        >
          <RefreshCw className="h-3.5 w-3.5 text-white/45" />
          <span className="text-[12px] font-medium text-white/70">Auto-Refresh (Live Sync)</span>
          <button
            id="auto-refresh"
            type="button"
            role="switch"
            aria-checked={autoRefresh}
            aria-label="Auto-refresh live sync"
            onClick={() => onAutoRefreshChange(!autoRefresh)}
            className={`inline-flex h-4 w-7 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
              autoRefresh ? 'bg-emerald-400' : 'bg-white/15'
            }`}
          >
            <span
              className={`pointer-events-none block h-3 w-3 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                autoRefresh ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </label>

        <button
          type="button"
          onClick={onLockSwitch}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/75 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span className="hidden sm:inline">Lock / Switch Shop Key</span>
          <span className="sm:hidden">Lock</span>
        </button>
      </div>
    </header>
  );
}
