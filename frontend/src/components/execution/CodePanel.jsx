"use client";

import { useState } from "react";

/**
 * Props:
 *  - sourceCode: [{ line, text }]
 *  - irCode: [{ op, args, line }]
 *  - currentLine: number (from snapshot)
 */

// Helper: Highlight Python code
function highlightPython(code) {
  const pythonKeywords = /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|lambda|yield|break|continue|pass|assert|raise|del|in|is|and|or|not|True|False|None)\b/g;
  const builtins = /\b(print|len|range|str|int|float|list|dict|set|tuple|open|file|input|map|filter|sum|max|min|enumerate|zip|reversed|sorted)\b/g;
  const strings = /(['"])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /#.*$/gm;
  const numbers = /\b\d+\.?\d*\b/g;

  let result = code;
  const parts = [];
  let lastIndex = 0;
  const replacements = [];

  // Find all tokens
  let match;
  const commentRegex = new RegExp(comments.source, 'gm');
  while ((match = commentRegex.exec(code)) !== null) {
    replacements.push({ start: match.index, end: match.index + match[0].length, type: 'comment', text: match[0] });
  }

  const stringRegex = new RegExp(strings.source, 'g');
  while ((match = stringRegex.exec(code)) !== null) {
    replacements.push({ start: match.index, end: match.index + match[0].length, type: 'string', text: match[0] });
  }

  const keywordRegex = new RegExp(pythonKeywords.source, 'g');
  while ((match = keywordRegex.exec(code)) !== null) {
    if (!replacements.some(r => match.index >= r.start && match.index < r.end)) {
      replacements.push({ start: match.index, end: match.index + match[0].length, type: 'keyword', text: match[0] });
    }
  }

  const builtinRegex = new RegExp(builtins.source, 'g');
  while ((match = builtinRegex.exec(code)) !== null) {
    if (!replacements.some(r => match.index >= r.start && match.index < r.end)) {
      replacements.push({ start: match.index, end: match.index + match[0].length, type: 'builtin', text: match[0] });
    }
  }

  const numberRegex = new RegExp(numbers.source, 'g');
  while ((match = numberRegex.exec(code)) !== null) {
    if (!replacements.some(r => match.index >= r.start && match.index < r.end)) {
      replacements.push({ start: match.index, end: match.index + match[0].length, type: 'number', text: match[0] });
    }
  }

  replacements.sort((a, b) => a.start - b.start);

  return replacements.length > 0 ? { tokens: replacements, code } : null;
}

// Helper: Colorized span renderer
function CodeSpan({ token }) {
  const colorMap = {
    keyword: 'text-pink-400',
    string: 'text-green-400',
    comment: 'text-gray-500 italic',
    number: 'text-yellow-400',
    builtin: 'text-blue-400',
  };

  return (
    <span className={colorMap[token.type] || 'text-on-surface'}>
      {token.text}
    </span>
  );
}

function renderCodeLine(text) {
  const highlighted = highlightPython(text);
  
  if (!highlighted) {
    return <span className="text-on-surface">{text}</span>;
  }

  const { tokens, code } = highlighted;
  const parts = [];
  let lastEnd = 0;

  tokens.forEach((token, idx) => {
    if (lastEnd < token.start) {
      parts.push(
        <span key={`text-${idx}`} className="text-on-surface">
          {code.slice(lastEnd, token.start)}
        </span>
      );
    }
    parts.push(<CodeSpan key={`token-${idx}`} token={token} />);
    lastEnd = token.end;
  });

  if (lastEnd < code.length) {
    parts.push(
      <span key="text-end" className="text-on-surface">
        {code.slice(lastEnd)}
      </span>
    );
  }

  return parts;
}

export default function CodePanel({
  sourceCode = [],
  irCode = [],
  currentLine = null,
}) {
  const [activeTab, setActiveTab] = useState("source");

  // 🔹 Format IR nicely
  const formattedIR = irCode.map((instr, idx) => ({
    line: idx + 1,
    text: `${instr.op} ${instr.args.join(" ")}`,
    originalLine: instr.line,
  }));

  const displayData =
    activeTab === "source"
      ? sourceCode
      : formattedIR;


  return (
    <section className="col-span-4 bg-surface-container-low flex flex-col h-full">
      
      {/* Tabs as Buttons */}
      <div className="flex bg-surface-container-low px-4 pt-2 gap-2 border-b border-outline-variant/15 flex-shrink-0">
        <button
          onClick={() => setActiveTab("source")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === "source"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-primary"
          }`}
        >
          Source Code
        </button>

        <button
          onClick={() => setActiveTab("ir")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
            activeTab === "ir"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-primary"
          }`}
        >
          Program Model (IR)
        </button>
      </div>

      {/* Code Area with Fixed Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Line Numbers - Fixed Width, Scrolls with Code */}
          <div className="w-12 bg-surface-container-high border-r border-outline-variant/15 flex-shrink-0 py-4">
            <div className="space-y-0 text-xs text-on-surface-variant font-mono text-right pr-2 select-none">
              {displayData.map(({ line }) => (
                <div key={line} className="h-6 flex items-center justify-end">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Code - Scrolls with Line Numbers */}
          <div className="flex-1 bg-surface-container-lowest font-mono text-[13px] whitespace-pre">
            <div className="py-4 px-4">
              {displayData.map((item) => {
                const isActive =
                  activeTab === "source"
                    ? item.line === currentLine
                    : item.originalLine === currentLine;

                return (
                  <div
                    key={item.line}
                    className={`h-6 flex items-center ${
                      isActive
                        ? "bg-surface-container-highest border-l-2 border-primary pl-2"
                        : ""
                    }`}
                  >
                    {activeTab === "source" 
                      ? renderCodeLine(item.text) 
                      : <span className="text-cyan-300">{item.text}</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}