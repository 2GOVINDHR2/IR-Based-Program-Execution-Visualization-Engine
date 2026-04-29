"use client";

import { useState } from "react";
import ProgramCard from "@/components/ProgramCard";
import InfoPanel from "@/components/InfoPanel";

export default function ProgramsClient({ programs, stats }) {
  const defaultActive = programs.find((p) => p.isActive) ?? programs[0];
  const [activeProgram, setActiveProgram] = useState(defaultActive);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Program List */}
      <div className="lg:col-span-8 space-y-4">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={{
              ...program,
              isActive: activeProgram?.id === program.id,
            }}
            onClick={setActiveProgram}
          />
        ))}
      </div>

      {/* Info Panel */}
      <InfoPanel
        stats={stats}
        activeSnippet={activeProgram?.snippet ?? []}
      />
    </div>
  );
}
