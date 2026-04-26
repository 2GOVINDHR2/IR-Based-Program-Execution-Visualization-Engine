// components/execution/StatePanel.jsx

/**
 * Right panel: Execution state — local variables, registers, call stack.
 *
 * Props:
 *  - localVariables : { name, type, value, isActive }[]
 *  - registers      : { name, value, isActive }[]
 *  - callStack      : { index, label, address, isActive }[]
*/

export default function StatePanel({ localVariables = [], registers = [], callStack = [] }) {
  return (
    <section className="col-span-1 lg:col-span-4 bg-surface-container-low flex flex-col min-h-0 h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-8">

        {/* Local Variables */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
              Local Variables
            </h3>
            <span className="material-symbols-outlined text-sm text-outline">analytics</span>
          </div>
          <div className="space-y-2">
            {localVariables.map((v) => (
              <div
                key={v.name}
                className="bg-surface-container-lowest p-3 rounded flex justify-between items-center"
              >
                <span className="font-mono text-sm text-on-surface-variant">{v.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-outline">{v.type}</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      v.isActive ? "text-tertiary" : "text-on-surface"
                    }`}
                  >
                    {typeof v.value === 'object' && v.value !== null ? JSON.stringify(v.value) : String(v.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Registers</h3>
            <span className="material-symbols-outlined text-sm text-outline">memory</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {registers.map((reg) => (
              <div
                key={reg.name}
                className={
                  reg.isActive
                    ? "bg-tertiary-container/20 p-3 rounded border border-tertiary/10"
                    : "bg-surface-container-lowest p-3 rounded"
                }
              >
                <p
                  className={`text-[10px] font-mono font-bold mb-1 ${
                    reg.isActive ? "text-tertiary" : "text-outline"
                  }`}
                >
                  {reg.name}
                </p>
                <p
                  className={`font-mono text-lg font-black ${
                    reg.isActive ? "text-tertiary" : "text-on-surface"
                  }`}
                >
                  {reg.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call Stack */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Call Stack</h3>
            <span className="material-symbols-outlined text-sm text-outline">layers</span>
          </div>
          <div className="space-y-1 relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant/20 rounded-full" />
            {callStack.map((frame) => (
              <div
                key={frame.index}
                className={`p-3 rounded-r-lg border-l-2 ${
                  frame.isActive
                    ? "bg-surface-container-highest border-primary"
                    : "bg-surface-container-lowest/50 border-transparent opacity-60"
                }`}
              >
                <p
                  className={`text-[10px] font-mono font-bold ${
                    frame.isActive ? "text-primary" : "text-on-surface"
                  }`}
                >
                  #{frame.index} {frame.label}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">{frame.address}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
