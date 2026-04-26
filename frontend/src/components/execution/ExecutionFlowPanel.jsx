// components/execution/ExecutionFlowPanel.jsx
import { useEffect, useRef } from 'react';

/**
 * Center panel: Execution flow steps.
 *
 * Props:
 *  - steps       : ExecutionStep[]
 *  - currentStep : number
 *  - totalSteps  : number
 */
export default function ExecutionFlowPanel({ steps = [], currentStep, totalSteps }) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const activeStepRef = useRef(null);

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  return (
    <section className="col-span-1 lg:col-span-4 bg-surface flex flex-col min-h-0 h-[50vh] lg:h-full border-y lg:border-y-0 lg:border-x border-outline-variant/15 relative">
      <div className="p-6 pb-2 border-b border-outline-variant/10 z-10 shrink-0">
        <h2 className="text-lg font-bold text-on-surface">Execution Flow</h2>
      </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
          {steps.map((step) => {
            if (step.state === "active") {
              return (
                <div ref={activeStepRef} key={step.id} className="flex items-center gap-4 relative">
                  <div className="absolute left-4 -top-4 -bottom-4 w-[1px] bg-primary/20" />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-mono z-10 shadow-lg">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 bg-surface-container-highest p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                        {step.opcode}
                      </p>
                      <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-0.5 rounded-full font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="font-mono text-base font-bold text-on-surface">
                      {typeof step.instruction === "object" ? JSON.stringify(step.instruction) : step.instruction}
                    </p>
                    {step.detail && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/15">
                        <p className="text-xs text-on-surface-variant">
                          Accessing memory offset{" "}
                          <span className="font-mono bg-secondary-container px-1 rounded">
                            {step.memoryOffset}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            const isPast = step.state === "past";
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 ${isPast ? "opacity-40" : "opacity-60"}`}
              >
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-mono">
                  {step.stepNumber}
                </div>
                <div className="flex-1 bg-surface-container-low p-4 rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-outline mb-1">
                    {step.opcode}
                  </p>
                  <p className="font-mono text-sm">{typeof step.instruction === "object" ? JSON.stringify(step.instruction) : step.instruction}</p>
                </div>
              </div>
            );
          })}
        </div>

      {/* Progress Bar */}
      <div className="mt-auto p-6 bg-surface-container-low/50 sticky bottom-0 border-t border-outline-variant/10 z-20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-medium text-on-surface-variant">Progress</span>
          <span className="text-xs font-bold text-primary">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
