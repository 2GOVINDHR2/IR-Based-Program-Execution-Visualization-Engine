// components/ui/TopAppBar.jsx
import Link from "next/link";

const navLinks = [
  { label: "Library", href: "#", active: false },
  { label: "Workspace", href: "#", active: true },
  { label: "Documentation", href: "#", active: false },
];

export default function TopAppBar() {
  return (
    <header className="bg-[#f8f9fb] dark:bg-slate-950 fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-3">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tighter">
          The Precision Lab
        </span>
        <nav className="hidden md:flex gap-6 items-center font-['Inter'] font-medium text-sm tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "text-[#005bc0] dark:text-blue-400 font-semibold border-b-2 border-[#005bc0]"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#005bc0] dark:hover:text-blue-300 transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            className="bg-surface-container-low border-none rounded-lg text-sm px-4 py-1.5 w-64 focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search experiments..."
            type="text"
          />
        </div>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          settings
        </span>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          help
        </span>
      </div>
    </header>
  );
}
