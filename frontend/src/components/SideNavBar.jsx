"use client";
// components/ui/SideNavBar.jsx
import { usePathname } from "next/navigation";
import NavItem from "./NavItem";

const navItems = [
  { icon: "code_blocks", label: "Programs", href: "/" },
  { icon: "play_circle", label: "Execution", href: "/execution/factorial_iterative" },
  { icon: "bug_report", label: "Debugger", href: "#" },
  { icon: "history", label: "History", href: "#" },
];

export default function SideNavBar() {
  const pathname = usePathname();
  return (
    <aside className="bg-surface-container-low dark:bg-slate-900 flex flex-col h-screen fixed left-0 top-0 pt-16 w-20 md:w-64 z-40 transition-transform duration-200 ease-in-out">
      {/* Lab Title */}
      <div className="px-6 py-8 hidden md:block">
        <p className="text-lg font-black text-slate-800 dark:text-slate-200">Lab Environment</p>
        <p className="font-['Inter'] text-[10px] font-semibold tracking-widest uppercase text-slate-500 mt-1">
          v1.0.1-stable
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          let isActive = false;
          if (item.href === "/") {
            isActive = pathname === "/";
          } else if (item.href !== "#") {
            isActive = pathname.startsWith(item.href);
          }
          return (
            <NavItem
              key={item.label}
              {...item}
              isActive={isActive}
              variant="side"
            />
          );
        })}
      </nav>

      {/* New Trace Button */}
      <div className="p-4 border-t border-outline-variant/10">
        <button className="w-full bg-primary text-on-primary py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="hidden md:block font-['Inter'] text-xs font-semibold tracking-widest uppercase">
            New Trace
          </span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 flex items-center gap-3 mt-auto">
        <div className="h-10 w-10 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-bold text-sm">
          JD
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold">User Profile</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
            Researcher
          </p>
        </div>
      </div>
    </aside>
  );
}
