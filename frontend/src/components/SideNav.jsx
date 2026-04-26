export default function SideNav() {
  return (
    <aside className="fixed left-0 top-0 pt-16 w-20 md:w-64 h-screen bg-slate-100 border-r">
      <nav className="p-3 space-y-2">
        <div className="bg-white border-l-4 border-blue-600 p-3 text-blue-600 font-semibold">
          Programs
        </div>
        <div className="p-3 text-slate-500">Execution</div>
        <div className="p-3 text-slate-500">Debugger</div>
        <div className="p-3 text-slate-500">History</div>
      </nav>
    </aside>
  );
}