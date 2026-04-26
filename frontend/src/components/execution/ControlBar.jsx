// components/execution/ControlBar.jsx
"use client";

/**
 * Bottom fixed control bar — play/pause, step forward/back, reset.
 *
 * Props:
 *  - status        : "running" | "paused" | "finished"
 *  - pc            : string   (program counter)
 *  - executionTime : string
 *  - opsPerSec     : string
 *  - onPlay        : () => void
 *  - onStepBack    : () => void
 *  - onStepForward : () => void
 *  - onReset       : () => void
 */
export default function ControlBar({
  status = "paused",
  pc,
  executionTime,
  opsPerSec,
  isAtStart,
  onPlay,
  onStepBack,
  onStepForward,
  onReset,
}) {
  const isPaused = status === "paused";

  const statusColor = {
    paused: "bg-tertiary",
    running: "bg-primary",
    finished: "bg-secondary",
  }[status] ?? "bg-tertiary";

  return (
    <footer className="fixed bottom-0 left-20 md:left-64 right-0 h-16 bg-surface-container-lowest dark:bg-slate-900 flex items-center justify-between px-8 z-50">
      {/* Status + PC */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-bold text-on-surface tracking-wider uppercase">
            {status}
          </span>
        </div>
        {pc && (
          <span className="text-[10px] font-mono text-outline">PC: {pc}</span>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={onPlay}
          className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-on-primary hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">
            {isPaused ? "play_arrow" : "pause"}
          </span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/30 mx-2" />

        {/* Step Back */}
        <button
          onClick={onStepBack}
          disabled={isAtStart}
          className={`flex items-center justify-center w-10 h-10 rounded-md bg-surface-container-high transition-all ${
            isAtStart
              ? "text-on-surface-variant opacity-40 cursor-not-allowed"
              : "text-on-surface hover:bg-surface-container-highest active:scale-95"
          }`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/30 mx-2" />

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center justify-center w-10 h-10 rounded-md bg-error-container/20 text-error hover:bg-error-container/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] text-outline uppercase tracking-widest font-bold">
            Execution Time
          </p>
          <p className="text-sm font-mono font-bold">{executionTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Ops/Sec</p>
          <p className="text-sm font-mono font-bold">{opsPerSec}</p>
        </div>
      </div>
    </footer>
  );
}
