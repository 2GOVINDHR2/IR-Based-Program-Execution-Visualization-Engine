export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-3 bg-white border-b">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tight">
          The Precision Lab
        </span>
        <nav className="hidden md:flex gap-6 text-sm">
          <span className="text-slate-500">Library</span>
          <span className="text-blue-600 font-semibold border-b-2 border-blue-600">
            Workspace
          </span>
          <span className="text-slate-500">Documentation</span>
        </nav>
      </div>

      <div className="flex gap-4">
        <input
          className="hidden sm:block bg-slate-100 rounded px-3 py-1 text-sm"
          placeholder="Search experiments..."
        />
      </div>
    </header>
  );
}