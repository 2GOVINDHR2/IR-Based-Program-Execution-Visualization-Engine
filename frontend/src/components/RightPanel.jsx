export default function RightPanel() {
  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">
          Lab Statistics
        </h4>

        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">12.4ms</p>
            <p className="text-xs text-slate-500">Avg Execution</p>
          </div>

          <div>
            <p className="text-2xl font-bold">1.2GB</p>
            <p className="text-xs text-slate-500">Heap Cap</p>
          </div>
        </div>
      </div>

      {/* Snippet */}
      <div className="bg-black text-white p-6 rounded-lg text-xs font-mono">
        <p>function factorial(n) {'{'}</p>
        <p className="pl-4">if (n === 0) return 1;</p>
        <p className="pl-4">return n * factorial(n - 1);</p>
        <p>{'}'}</p>
      </div>

    </div>
  );
}