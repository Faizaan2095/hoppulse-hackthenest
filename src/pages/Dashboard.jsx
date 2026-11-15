import { useCallback, useEffect, useState } from 'react';
import { BarChart3, BookOpen, PhoneCall } from 'lucide-react';
import ActivationGate from '../components/ActivationGate.jsx';
import DashboardHeader from '../components/DashboardHeader.jsx';
import ShopBar from '../components/ShopBar.jsx';
import KpiStrip from '../components/KpiStrip.jsx';
import CallLogTable from '../components/CallLogTable.jsx';
import CallDetailDrawer from '../components/CallDetailDrawer.jsx';
import PickupDialog from '../components/PickupDialog.jsx';
import PerformanceTab from '../components/PerformanceTab.jsx';
import HelpTab from '../components/HelpTab.jsx';
import { api } from '../lib/api.js';
import { clearShopCode, readShopCode, saveShopCode } from '../lib/session.js';

const TABS = [
  { id: 'log', label: 'Live Calls', icon: PhoneCall },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'help', label: 'Help', icon: BookOpen },
];

export default function Dashboard() {
  const [tab, setTab] = useState('log');
  const [checking, setChecking] = useState(true);
  const [shop, setShop] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [pickupTarget, setPickupTarget] = useState(null);
  const [error, setError] = useState('');

  const code = shop?.shop_hex_code || '';

  const loadCalls = useCallback(async (force) => {
    if (!code) {
      setCalls([]);
      setLoading(false);
      return;
    }
    if (force) setLoading(true);
    try {
      const { calls: rows } = await api.calls(code);
      setCalls(rows ?? []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Restore an activated terminal from the previous visit.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = readShopCode();
      if (!saved) {
        if (!cancelled) {
          setShop(null);
          setLoading(false);
          setChecking(false);
        }
        return;
      }
      try {
        const { shop: found } = await api.shop(saved);
        if (!cancelled) {
          setShop(found);
          setChecking(false);
        }
      } catch {
        clearShopCode();
        if (!cancelled) {
          setShop(null);
          setLoading(false);
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadCalls(false);
  }, [loadCalls]);

  useEffect(() => {
    if (!autoRefresh || !code) return undefined;
    const timer = setInterval(() => loadCalls(false), 5000);
    return () => clearInterval(timer);
  }, [autoRefresh, code, loadCalls]);

  function activate(found) {
    saveShopCode(found.shop_hex_code);
    setShop(found);
    setCalls([]);
    setSelectedId(null);
    setPickupTarget(null);
    setTab('log');
    setChecking(false);
  }

  function lock() {
    clearShopCode();
    setShop(null);
    setCalls([]);
    setSelectedId(null);
    setPickupTarget(null);
    setTab('log');
  }

  async function toggleDone(call) {
    const next = call.is_done !== true;
    setCalls((rows) => rows.map((row) => (row.id === call.id ? { ...row, is_done: next } : row)));
    try {
      await api.setDone(code, call.id, next);
    } catch (err) {
      setError(err.message);
      loadCalls(false);
    }
  }

  async function confirmPickup() {
    const target = pickupTarget;
    if (!target) return;
    const patch = { picked_up: true, caller_name: 'Picked Up', phone: '', appointment_time: '', summary: '', transcript: '' };
    setCalls((rows) => rows.map((row) => (row.id === target.id ? { ...row, ...patch } : row)));
    setPickupTarget(null);
    setSelectedId(null);
    try {
      await api.pickUp(code, target.id);
    } catch (err) {
      setError(err.message);
    }
    loadCalls(false);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
      </div>
    );
  }

  if (!shop) return <ActivationGate onActivate={activate} />;

  const selected = calls.find((call) => call.id === selectedId) || null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[130px]" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <ShopBar shop={shop} />
        <DashboardHeader
          shop={shop}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onLockSwitch={lock}
        />

        <div className="mt-5 inline-flex w-full gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-1 sm:w-auto">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-selected={active}
                role="tab"
                className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-medium transition-all duration-300 sm:flex-none ${
                  active
                    ? 'bg-white text-black shadow-[0_6px_20px_-8px_rgba(255,255,255,0.5)]'
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                {item.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2.5 text-[12px] text-rose-200">
            {error}
          </div>
        ) : null}

        <main className="mt-4" style={{ animation: 'spEnter 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          {tab === 'log' ? (
            <div className="space-y-4">
              <KpiStrip calls={calls} />
              <CallLogTable
                calls={calls}
                onSelect={setSelectedId}
                onToggleDone={toggleDone}
                onMarkPickedUp={setPickupTarget}
                loading={loading}
              />
            </div>
          ) : null}

          {tab === 'performance' ? <PerformanceTab calls={calls} /> : null}
          {tab === 'help' ? <HelpTab shop={shop} /> : null}
        </main>

        <p className="mt-6 pb-2 text-center text-[11px] text-white/25">
          ShopPulse · AI receptionist analytics for local shops · Ypsilanti, MI
        </p>
      </div>

      <CallDetailDrawer call={selected} onClose={() => setSelectedId(null)} />
      <PickupDialog call={pickupTarget} onCancel={() => setPickupTarget(null)} onConfirm={confirmPickup} />
    </div>
  );
}
