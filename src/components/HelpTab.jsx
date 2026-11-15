import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '../lib/api.js';

const PAYLOAD = `{
  "shop_hex_code": "0x4A9F",
  "caller_name": "Ray Mitchell",
  "phone": "(567) 461-9381",
  "vehicle_issue": "2014 Honda Civic — front brake pads",
  "appointment_time": "Today, 11:00 AM",
  "estimated_value": 65,
  "status": "Booked",
  "summary": "Grinding under braking; customer approved the quote.",
  "transcript": "AI: Thanks for calling ... Caller: my brakes grind ..."
}`;

const LOOKUP = `{
  "shop_hex_code": "0x4A9F",
  "phone": "5674619381"
}`;

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/60 px-5 py-4">
      <h3 className="font-display text-[14px] font-medium text-white">{title}</h3>
      <div className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-white/55">{children}</div>
    </div>
  );
}

function Code({ children }) {
  return (
    <code className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11.5px] text-emerald-200">
      {children}
    </code>
  );
}

function Block({ children }) {
  return (
    <pre className="sp-scroll overflow-x-auto rounded-xl border border-white/[0.07] bg-black p-3 font-mono text-[11.5px] leading-relaxed text-emerald-200/90">
      {children}
    </pre>
  );
}

export default function HelpTab({ shop }) {
  const [system, setSystem] = useState(null);

  useEffect(() => {
    api
      .system()
      .then(setSystem)
      .catch(() => setSystem(null));
  }, []);

  const receiveUrl = system?.receive_call_url || '/api/receive-call';
  const statusUrl = system?.check_status_url || '/api/check-order-status';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.07] bg-black/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-emerald-300" />
            <h2 className="font-display text-[15px] font-medium text-white">ShopPulse reference</h2>
          </div>
          <span className="rounded-md border border-emerald-400/25 bg-black px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald-300">
            {shop.shop_hex_code}
          </span>
        </div>
        <p className="mt-1.5 text-[11.5px] text-white/35">
          Everything the voice agent, Make.com and staff need, in one page.
        </p>
      </div>

      <Section title="How a call becomes a job">
        <p>
          Your voice agent answers the phone, collects the details and posts them to the receive-call webhook. The
          webhook checks the shared secret, looks up the shop by its hex key, assigns an open bay and saves the job to
          this dashboard.
        </p>
        <p>
          Bays are assigned per appointment time: <Code>Bay 1</Code> and <Code>Bay 2</Code> fill first, walk-ins and
          tow-ins take <Code>Walk-In Overflow</Code>. When both bays are taken for that time the job is saved as{' '}
          <Code>Waitlist / Reschedule Needed</Code> so staff can call the customer back.
        </p>
      </Section>

      <Section title={`Receive a call — POST ${receiveUrl}`}>
        <p>
          Accepts <Code>POST</Code> with the header <Code>x-webhook-secret</Code>. Missing or wrong secret returns{' '}
          <Code>401</Code>; browser preflight <Code>OPTIONS</Code> returns <Code>200</Code>; any other method returns{' '}
          <Code>405</Code>. A good post returns <Code>{'{ "success": true }'}</Code> with the assigned bay and status.
        </p>
        <Block>{PAYLOAD}</Block>
        <p>
          Valid statuses: <Code>Booked</Code>, <Code>Urgent Tow</Code>, <Code>Quote Given</Code>,{' '}
          <Code>Waitlist / Reschedule Needed</Code>. Anything else falls back to <Code>Booked</Code>.
        </p>
      </Section>

      <Section title={`Order status lookup — POST ${statusUrl}`}>
        <p>
          Send a shop key plus either a phone number or a caller name. The lookup searches that shop first, then
          matches the newest record by phone digits (punctuation and country code ignored) or by name.
        </p>
        <Block>{LOOKUP}</Block>
        <p>
          Ready order → <Code>{'{ "found": true, "is_done": true, "pickup_time": "…" }'}</Code>. In progress →{' '}
          <Code>{'{ "found": true, "is_done": false, "estimated_time": "…" }'}</Code>. Nothing matches →{' '}
          <Code>{'{ "found": false }'}</Code>.
        </p>
      </Section>

      <Section title="Done / Ready">
        <p>
          Tick <strong className="text-white/80">Done / Ready</strong> when the job is finished and waiting for the
          customer. It saves immediately and is what your customer sees when they ask for status.
        </p>
      </Section>

      <Section title="Picked Up clears the customer">
        <p>
          When the customer collects, tick <strong className="text-white/80">Picked Up</strong> and confirm. The name,
          phone number, appointment, AI summary and transcript are erased for good, the row fades to “Picked Up”, and
          the job, its value and its revenue stay in the log and in your totals. Because the details are gone, status
          lookups by that name or number will no longer find the record — and it cannot be undone.
        </p>
      </Section>

      <Section title="Shared webhook secret">
        <p>
          Both webhooks use one secret. This build defaults to <Code>shoppulse_live_9823</Code> so an existing Make.com
          scenario keeps working; set <Code>WEBHOOK_SECRET</Code> in the environment to rotate it, then update Make.com
          and the voice agent.
        </p>
      </Section>
    </div>
  );
}
