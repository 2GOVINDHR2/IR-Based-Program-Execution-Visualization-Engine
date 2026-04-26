// components/ui/InfoPanel.jsx
import Link from "next/link";

/**
 * Right-side info panel with lab stats, snippet preview, and support card.
 *
 * Props:
 *  - stats: { avgExecutionSync: string, heapAllocationCap: string }
 *  - activeSnippet: array of { text, color, indent? } — from the active program
 */
export default function InfoPanel({ stats, activeSnippet = [] }) {
  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Stats Card */}
      <div className="bg-surface-container-low p-6 rounded-xl">
        <h4 className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-on-surface-variant mb-6">
          Lab Statistics
        </h4>
        <div className="space-y-6">
          <div>
            <p className="text-[2.25rem] font-bold text-primary leading-none">
              {stats.avgExecutionSync}
            </p>
            <p className="text-[0.6875rem] font-bold tracking-widest uppercase text-on-surface-variant mt-2">
              Avg. Execution Sync
            </p>
          </div>
          <div className="h-[1px] bg-outline-variant opacity-10" />
          <div>
            <p className="text-[2.25rem] font-bold text-on-background leading-none">
              {stats.heapAllocationCap}
            </p>
            <p className="text-[0.6875rem] font-bold tracking-widest uppercase text-on-surface-variant mt-2">
              Heap Allocation Cap
            </p>
          </div>
        </div>
      </div>

      {/* Snippet Preview */}
      <div className="bg-inverse-surface p-6 rounded-xl text-surface-container-lowest overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <span className="material-symbols-outlined text-6xl">terminal</span>
        </div>
        <h4 className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-surface-dim mb-4">
          Snippet Preview
        </h4>
        <div className="font-mono text-xs space-y-1">
          {activeSnippet.length > 0 ? (
            activeSnippet.map((line, i) => (
              <p key={i} className={`${line.color} ${line.indent ? "pl-4" : ""}`}>
                {line.text}
              </p>
            ))
          ) : (
            <p className="text-surface-dim opacity-60 italic text-[10px]">
              Select a program to preview its snippet.
            </p>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-surface-variant/10">
          <p className="text-[10px] text-surface-dim leading-relaxed italic">
            &quot;Hover over a program to see its structural logic and time-complexity metadata
            here.&quot;
          </p>
        </div>
      </div>

      {/* Support Card */}
      <div className="bg-surface-container-high p-6 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-tertiary">info</span>
        <div>
          <h5 className="text-sm font-bold tracking-tight mb-1">New to the Lab?</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Check the{" "}
            <Link
              href="#"
              className="text-primary font-semibold underline decoration-2 underline-offset-2"
            >
              Quickstart Guide
            </Link>{" "}
            to understand how stack frames are visualized in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
