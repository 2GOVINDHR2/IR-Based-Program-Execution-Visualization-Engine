// components/ui/Badge.jsx

/**
 * Small label badge used on program cards.
 *
 * Props:
 *  - label  : string
 *  - bgClass: tailwind bg class   (e.g. "bg-secondary-container")
 *  - textClass: tailwind text class (e.g. "text-on-secondary-container")
 */
export default function Badge({ label, bgClass = "bg-surface-container-high", textClass = "text-on-surface-variant" }) {
  return (
    <span
      className={`${bgClass} ${textClass} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest`}
    >
      {label}
    </span>
  );
}
