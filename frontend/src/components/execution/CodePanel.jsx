// components/execution/CodePanel.jsx
"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Left panel: Source Code / IR JSON tab view.
 *
 * Props:
 *  - sourceCode: { line, text, isActive? }[]
 */
export default function CodePanel({ sourceCode = [] }) {
  const [activeTab, setActiveTab] = useState("source");
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sourceCode]);

  // Helper to perform smart sub-line token highlighting
  const renderHighlightedText = (text, activeArgs) => {
    if (!activeArgs || activeArgs.length === 0) return text;
    const argsToHighlight = activeArgs.filter(a => typeof a === 'string' && a.length > 0);
    if (argsToHighlight.length === 0) return text;

    try {
      // Escape for regex
      const escapedArgs = argsToHighlight.map(a => a.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      const pattern = new RegExp(`\\b(${escapedArgs.join('|')})\\b`, 'g');
      const parts = text.split(pattern);

      return parts.map((part, i) => {
        if (argsToHighlight.includes(part)) {
          return <mark key={i} className="bg-primary/30 text-primary font-bold px-0.5 rounded">{part}</mark>;
        }
        return part;
      });
    } catch(e) {
      return text;
    }
  };

  return (
    <section className="col-span-1 lg:col-span-4 bg-surface-container-low flex flex-col min-h-0 h-[50vh] lg:h-full relative border-y lg:border-y-0 lg:border-r border-outline-variant/15">
      {/* Tabs */}
      <div className="flex bg-surface px-4 pt-4 gap-2">
        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 text-xs font-bold rounded-t-md border-b-0 transition-colors ${
            activeTab === "source"
              ? "bg-surface-container-lowest text-on-surface"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Source Code
        </button>
        <button
          onClick={() => setActiveTab("ir")}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "ir"
              ? "bg-surface-container-lowest text-on-surface rounded-t-md"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Program Model (IR JSON)
        </button>
      </div>

      {/* Code Area */}
      <div className="flex-1 bg-surface-container-lowest m-4 rounded-lg overflow-auto custom-scrollbar font-mono text-[13px] leading-relaxed relative">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-surface-container-low border-r border-outline-variant/15 flex flex-col items-center py-4 text-outline select-none text-xs">
          {sourceCode.map(({ line, isActive }) => (
            <span key={line} className={isActive ? "text-primary font-bold" : ""}>
              {line}
            </span>
          ))}
        </div>

        {/* Code Lines */}
        <div className="pl-14 py-4 pr-4 whitespace-pre text-on-surface">
          {sourceCode.map(({ line, text, isActive, activeArgs }) => (
            <div
              key={line}
              ref={isActive ? activeLineRef : null}
              className={
                isActive
                  ? "bg-surface-container-highest -ml-14 pl-14 min-w-[200%] border-l-2 border-primary py-0.5 shadow-sm"
                  : ""
              }
            >
              {isActive ? (
                <>
                  <span className="text-on-surface transition-all relative z-10">
                    {renderHighlightedText(text, activeArgs)}
                  </span>
                  {activeArgs && activeArgs.length > 0 && (
                    <span className="text-primary/60 text-[10px] italic ml-4 font-bold tracking-widest uppercase">
                      {'// Ops: ' + activeArgs.join(', ')}
                    </span>
                  )}
                </>
              ) : (
                <span className="opacity-70">{text}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
