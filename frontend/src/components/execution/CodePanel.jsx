// components/execution/CodePanel.jsx
"use client";

import { useState } from "react";

/**
 * Left panel: Source Code / IR JSON tab view.
 *
 * Props:
 *  - sourceCode: { line, text, isActive? }[]
 */
export default function CodePanel({ sourceCode = [] }) {
  const [activeTab, setActiveTab] = useState("source");

  return (
    <section className="col-span-4 bg-surface-container-low flex flex-col h-full">
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
          {sourceCode.map(({ line, text, isActive }) => (
            <div
              key={line}
              className={
                isActive
                  ? "bg-surface-container-highest -ml-14 pl-14 w-[200%] border-l-2 border-primary"
                  : ""
              }
            >
              {isActive ? (
                <>
                  {"    result = "}
                  <span className="text-primary">LOAD</span>
                  {"(n); "}
                  <span className="text-on-surface-variant italic">// Current step</span>
                </>
              ) : (
                text
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
