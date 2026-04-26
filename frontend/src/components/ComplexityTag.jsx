// components/ui/ComplexityTag.jsx

/**
 * Shows an icon + label for time or space complexity.
 *
 * Props:
 *  - icon      : string  (material symbol)
 *  - iconColor : string  (tailwind text color)
 *  - label     : string  (e.g. "O(n) Time")
 */
export default function ComplexityTag({ icon, iconColor = "text-tertiary", label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`material-symbols-outlined text-[14px] ${iconColor}`}>{icon}</span>
      <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">
        {label}
      </span>
    </div>
  );
}
