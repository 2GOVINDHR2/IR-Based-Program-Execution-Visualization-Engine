// components/ui/ProgramCard.jsx
"use client";

import Badge from "../src/components/Badge";
import ComplexityTag from "../src/components/ComplexityTag";

/**
 * Clickable program card used in the main list.
 *
 * Props: a program object from getPrograms()
 */
export default function ProgramCard({ program, onClick }) {
  const {
    title,
    description,
    tag,
    icon,
    iconFill,
    iconBg,
    iconColor,
    tagBg,
    tagColor,
    isActive,
    timeComplexity,
    spaceComplexity,
  } = program;

  return (
    <div
      onClick={() => onClick?.(program)}
      className={`group p-6 rounded-xl hover:bg-surface-container-highest transition-all duration-300 flex items-start gap-6 cursor-pointer ${
        isActive
          ? "bg-surface-container-lowest border-l-4 border-primary"
          : "bg-surface-container-low"
      }`}
    >
      {/* Icon */}
      <div className={`h-12 w-12 rounded ${iconBg} flex items-center justify-center ${iconColor} transition-colors`}>
        <span
          className="material-symbols-outlined"
          style={iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-on-surface tracking-tight">{title}</h3>
          <Badge label={tag} bgClass={tagBg} textClass={tagColor} />
        </div>
        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{description}</p>
        <div className="flex gap-4">
          <ComplexityTag icon="timer" iconColor="text-tertiary" label={timeComplexity} />
          <ComplexityTag icon="layers" iconColor="text-primary" label={spaceComplexity} />
        </div>
      </div>

      {/* Arrow */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-primary">arrow_forward_ios</span>
      </div>
    </div>
  );
}
