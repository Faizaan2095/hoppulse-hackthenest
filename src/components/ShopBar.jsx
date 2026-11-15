import { MapPin, Phone, Store } from 'lucide-react';

export default function ShopBar({ shop }) {
  if (!shop) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10">
          <Store className="h-[18px] w-[18px] text-emerald-300" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-medium text-white">{shop.shop_name}</p>
            <span className="rounded-md border border-emerald-400/25 bg-black px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald-300">
              {shop.shop_hex_code}
            </span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-white/45">
            <Phone className="h-3 w-3" />
            <span className="tabular-nums">{shop.phone_number || 'voice line pending'}</span>
            <span className="text-white/20">·</span>
            <span>{shop.industry}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-[11.5px] text-white/40">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="min-w-0 truncate">{shop.address}</span>
        <span
          className={`ml-1 shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] ${
            shop.webhook_active
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
              : 'border-white/12 bg-white/[0.04] text-white/40'
          }`}
        >
          {shop.webhook_active ? 'Webhook active' : 'Webhook paused'}
        </span>
      </div>
    </div>
  );
}
