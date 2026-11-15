import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { dayKey, money } from '../lib/format.js';

const STATUS_COLORS = {
  Booked: '#34d399',
  'Urgent Tow': '#fb7185',
  'Quote Given': '#38bdf8',
  'Waitlist / Reschedule Needed': '#fbbf24',
};

const TOOLTIP_STYLE = {
  background: 'rgba(10,10,10,0.95)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  fontSize: 12,
  color: '#fff',
};

function ChartCard({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/60 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-[14px] font-medium text-white">{title}</h3>
        <span className="text-[11px] text-white/35">{hint}</span>
      </div>
      {children}
    </div>
  );
}

export default function PerformanceTab({ calls = [] }) {
  const byStatus = Object.entries(
    calls.reduce((counts, call) => {
      const key = call.status || 'Booked';
      counts[key] = counts[key] || { status: key, calls: 0, revenue: 0 };
      counts[key].calls += 1;
      counts[key].revenue += Number(call.estimated_value) || 0;
      return counts;
    }, {}),
  ).map(([, value]) => value);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayCalls = calls.filter((call) => dayKey(call.created_date) === key);
    return {
      label: date.toLocaleDateString([], { weekday: 'short' }),
      calls: dayCalls.length,
      revenue: dayCalls.reduce((sum, call) => sum + (Number(call.estimated_value) || 0), 0),
    };
  });

  const totalRevenue = calls.reduce((sum, call) => sum + (Number(call.estimated_value) || 0), 0);
  const ready = calls.filter((call) => call.is_done && !call.picked_up).length;
  const collected = calls.filter((call) => call.picked_up);
  const collectedRevenue = collected.reduce((sum, call) => sum + (Number(call.estimated_value) || 0), 0);
  const avg = calls.length ? Math.round(totalRevenue / calls.length) : 0;

  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-black/60 px-6 py-24 text-center">
        <BarChart3 className="h-7 w-7 text-white/20" />
        <p className="text-[13.5px] font-medium text-white/70">Charts come alive with your first call</p>
        <p className="max-w-sm text-[12px] text-white/35">
          Status mix, daily volume and estimated revenue are built from real calls as your webhook feeds them in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Calls logged', value: calls.length, note: 'last 100 records' },
          { label: 'Estimated revenue', value: money(totalRevenue), note: `avg ${money(avg)} per call` },
          { label: 'Ready for pickup', value: ready, note: 'Done / Ready checked' },
          { label: 'Collected', value: money(collectedRevenue), note: `${collected.length} picked up` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/[0.07] bg-black/60 px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{stat.label}</p>
            <p className="mt-1.5 font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-white">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] text-white/35">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Call outcomes" hint="last 100 calls">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byStatus} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="calls" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#a3a3a3'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estimated revenue" hint="last 7 days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={days} margin={{ top: 4, right: 8, bottom: 0, left: -6 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => (name === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Calls'])}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={{ r: 2.5, fill: '#34d399', strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
