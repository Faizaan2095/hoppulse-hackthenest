import { Check } from 'lucide-react';

/**
 * shadcn-style checkbox: 16px rounded square, emerald when checked.
 * Rendered as a button so the same visual state works without a form.
 */
export default function Checkbox({ checked, onCheckedChange, label, className = '', disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onCheckedChange(!checked);
      }}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-white/25 bg-transparent hover:border-white/50'
      } ${className}`}
    >
      {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </button>
  );
}
