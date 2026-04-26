// app/execution/index.jsx
"use client";

import { useState } from "react";
import CodePanel from "@/components/execution/CodePanel";
import ExecutionFlowPanel from "@/components/execution/ExecutionFlowPanel";
import StatePanel from "@/components/execution/StatePanel";
import ControlBar from "@/components/execution/ControlBar";
import React, {  useEffect } from "react";

/**
 * CSR Client Component — owns execution playback state.
 *
 * Props: trace data fetched SSR in page.jsx
 */
export default function ExecutionClient({ trace }) {
  // Snapshots from backend
  const steps = trace?.snapshots || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("paused");
  const [autoPlay, setAutoPlay] = useState(false);

  // Autoplay effect
  useEffect(() => {
    if (!autoPlay || status !== "running") return;
    if (currentStep >= steps.length - 1) {
      setAutoPlay(false);
      setStatus("paused");
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }, 700); // 700ms per step
    return () => clearTimeout(timer);
  }, [autoPlay, status, currentStep, steps.length]);

  function handlePlay() {
    if (status === "paused") {
      setStatus("running");
      setAutoPlay(true);
    } else {
      setStatus("paused");
      setAutoPlay(false);
    }
  }

  function handleStepForward() {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    setStatus("paused");
    setAutoPlay(false);
  }

  function handleStepBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
    setStatus("paused");
    setAutoPlay(false);
  }

  function handleReset() {
    setCurrentStep(0);
    setStatus("paused");
    setAutoPlay(false);
  }

  // Prepare source code lines for CodePanel
  const sourceLines = (trace.source_code || "No source available")
  .split("\n")
  .map((text, idx) => ({
    line: idx + 1,
    text,
    isActive: false // Optionally highlight current line
  }));

  // Prepare execution flow steps for ExecutionFlowPanel
  const executionFlow = steps.map((step, idx) => ({
    ...step,
    id: idx,
    stepNumber: idx + 1,
    state: idx < currentStep ? "past" : idx === currentStep ? "active" : "future",
    // opcode, instruction, detail, memoryOffset can be mapped here if present
    opcode: step.opcode || "",
    instruction: step.instruction || JSON.stringify(step),
    detail: step.detail,
    memoryOffset: step.memoryOffset,
  }));

  // StatePanel expects localVariables, registers, callStack
  const currentSnapshot = steps[currentStep] || {};
  // 🔁 Convert locals → array
const localVariables = Object.entries(currentSnapshot.locals || {}).map(
  ([name, value]) => ({
    name,
    value,
    type: typeof value,
    isActive: false,
  })
);

// 🔁 Convert registers → array
const registers = Object.entries(currentSnapshot.registers || {}).map(
  ([name, value]) => ({
    name,
    value,
    isActive: false,
  })
);

// 🔁 Fake call stack
const callStack = [
  {
    index: currentSnapshot.stack_depth || 0,
    label: "main",
    address: `line ${currentSnapshot.line}`,
    isActive: true,
  },
];

  return (
    <>
      <main className="flex-1 flex flex-col pl-20 md:pl-64 pt-16 pb-16 bg-surface overflow-hidden">
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-auto">
          <CodePanel sourceCode={sourceLines} />
          <ExecutionFlowPanel
            steps={executionFlow}
            currentStep={currentStep + 1}
            totalSteps={steps.length}
          />
          <StatePanel
            localVariables={localVariables}
            registers={registers}
            callStack={callStack}
          />
        </div>
      </main>

      <ControlBar
        status={status}
        pc={currentSnapshot.pc || 0}
        executionTime={trace.executionTime || 0}
        opsPerSec={trace.opsPerSec || 0}
        onPlay={handlePlay}
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onReset={handleReset}
      />
    </>
  );
}
