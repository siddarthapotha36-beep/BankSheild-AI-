import React from 'react';
import { Eye } from 'lucide-react';

export default function HighlightedText({ text, highlights = [] }) {
  if (!text) return null;

  if (!highlights || highlights.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          Message Content Inspection
        </h4>
        <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 text-sm leading-relaxed text-slate-200 font-mono whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  // Find all match occurrences in text
  const matchSpans = [];
  const loweredText = text.toLowerCase();

  highlights.forEach((phrase) => {
    if (!phrase || !phrase.trim()) return;
    const phraseLower = phrase.toLowerCase().trim();
    let startIdx = 0;
    while ((startIdx = loweredText.indexOf(phraseLower, startIdx)) !== -1) {
      matchSpans.push({
        start: startIdx,
        end: startIdx + phraseLower.length
      });
      startIdx += phraseLower.length;
    }
  });

  // Sort spans by start
  matchSpans.sort((a, b) => a.start - b.start || b.end - a.end);

  // Merge overlapping or adjacent spans
  const mergedSpans = [];
  matchSpans.forEach((curr) => {
    if (!mergedSpans.length) {
      mergedSpans.push(curr);
    } else {
      const prev = mergedSpans[mergedSpans.length - 1];
      if (curr.start <= prev.end) {
        prev.end = Math.max(prev.end, curr.end);
      } else {
        mergedSpans.push(curr);
      }
    }
  });

  // Build rendered fragments
  const parts = [];
  let lastIndex = 0;

  mergedSpans.forEach((span, idx) => {
    if (span.start > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, span.start),
        highlight: false,
        key: `plain-${lastIndex}`
      });
    }
    parts.push({
      text: text.slice(span.start, span.end),
      highlight: true,
      key: `highlight-${span.start}`
    });
    lastIndex = span.end;
  });

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false,
      key: `plain-${lastIndex}`
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          Suspicious Text Breakdown
        </h4>
        <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-medium">
          {highlights.length} Flagged Phrase{highlights.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 text-sm leading-relaxed text-slate-200 font-mono whitespace-pre-wrap">
        {parts.map((p) =>
          p.highlight ? (
            <mark
              key={p.key}
              className="bg-rose-500/25 text-rose-200 font-semibold px-1 py-0.5 rounded border border-rose-500/50 underline decoration-rose-400/80 decoration-wavy transition"
              title="Identified fraud trigger"
            >
              {p.text}
            </mark>
          ) : (
            <span key={p.key}>{p.text}</span>
          )
        )}
      </div>
    </div>
  );
}
