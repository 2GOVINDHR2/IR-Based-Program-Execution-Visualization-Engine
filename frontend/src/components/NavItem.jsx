// components/ui/NavItem.jsx
import Link from "next/link";

/**
 * Reusable nav item used in both SideNavBar and BottomNavBar.
 *
 * Props:
 *  - href        : string
 *  - icon        : string  (material symbol name)
 *  - label       : string
 *  - isActive    : boolean
 *  - variant     : "side" | "bottom"
 */
export default function NavItem({ href = "#", icon, label, isActive = false, variant = "side" }) {
  if (variant === "bottom") {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 font-semibold ${
          isActive ? "text-[#005bc0]" : "text-slate-500"
        }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter">{label}</span>
      </Link>
    );
  }

  // side variant
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 group transition-all ${
        isActive
          ? "bg-surface-container-lowest dark:bg-slate-800 text-[#005bc0] dark:text-blue-300 border-l-4 border-[#005bc0]"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="hidden md:block font-['Inter'] text-xs font-semibold tracking-widest uppercase">
        {label}
      </span>
    </Link>
  );
}
