import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Globe,
  Radio
} from 'lucide-react';

export default function ExplainableAiCard({ analysisResult, rawMessage }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!analysisResult) return null;

  const { risk_score, verdict, scam_type, warnings = [], highlights = [], sender_details } = analysisResult;

  // Layer breakdown inference
  const hasUrlWarning = warnings.some(w => w.type?.includes('url') || w.type === 'lookalike_domain' || w.type === 'ip_host' || w.type === 'insecure_http' || w.type === 'suspicious_tld');
  const hasOtpWarning = warnings.some(w => w.type === 'credential');
  const hasUrgencyWarning = warnings.some(w => w.type === 'urgent');
  const hasSenderWarning = warnings.some(w => w.type === 'sender_spoof');
  const isDltVerified = sender_details?.is_authentic_header;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Explainable AI (XAI) Decision Breakdown
            </h4>
            <p className="text-[11px] text-slate-400">
              Multi-layer transparency report detailing why this message was classified as {verdict}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title={isExpanded ? 'Collapse XAI details' : 'Expand XAI details'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 text-xs">
          {/* Decision Summary */}
          <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Classification Rationale:</span>
              <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                verdict === 'Dangerous'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : verdict === 'Suspicious'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : verdict === 'CANNOT VERIFY'
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}>
                {risk_score}/100 &bull; {verdict}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {verdict === 'Dangerous' ? (
                <span>
                  The detector flagged this message because it contains high-threat triggers (such as credential harvesting or bank lookalike impersonation). In accordance with cyber banking safety protocols, an override elevated the score to at least 70/100.
                </span>
              ) : verdict === 'Suspicious' ? (
                <span>
                  The detector flagged moderate anomalies (e.g. artificial urgency, unverified phone callback, or shortened links) that deviate from normal scheduled banking communications.
                </span>
              ) : verdict === 'CANNOT VERIFY' ? (
                <span>
                  <strong>Safe Guardrail Active:</strong> The message does not possess definitive scam triggers, but lacks verifiable banking authentication (such as masked account numbers, official transaction UTR, or registered TRAI DLT header). To avoid false confidence, it is marked <strong>CANNOT VERIFY</strong>.
                </span>
              ) : (
                <span>
                  The message satisfies verified banking criteria: transactional details match standard scheduled formats, zero deceptive links or credential requests were found, and the sender is authentic.
                </span>
              )}
            </p>
          </div>

          {/* 4-Layer Inspection Pipeline */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Inspection Layer Evidence Trail:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Layer 1: Rule Engine */}
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    1. Pattern & Heuristic Rules
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    hasOtpWarning || hasUrgencyWarning ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {hasOtpWarning || hasUrgencyWarning ? 'Triggers Matched' : 'Clean'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Scanned for social engineering patterns, panic language, OTP requests, and remote access trojan bait.
                </p>
              </div>

              {/* Layer 2: URL Levenshtein Analyzer */}
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    2. URL & Lookalike Engine
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    hasUrlWarning ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {hasUrlWarning ? 'Anomalies Detected' : 'Verified / None'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Computed edit distance against scheduled bank portals, evaluated suspicious TLDs and HTTP encryption.
                </p>
              </div>

              {/* Layer 3: Telecom DLT Header Verification */}
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    3. Telecom DLT Registry
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isDltVerified ? 'bg-emerald-500/10 text-emerald-400' : hasSenderWarning ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDltVerified ? 'TRAI Verified' : hasSenderWarning ? 'GSM Spoofed' : 'Unregistered'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Verified 6-character alphabetic entity against approved Indian Scheduled Commercial Bank DLT headers.
                </p>
              </div>

              {/* Layer 4: Semantic Reasoning */}
              <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    4. Semantic Intent Scoring
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400">
                    {scam_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Evaluated overall communicative intent, payload context, and customer risk implications.
                </p>
              </div>
            </div>
          </div>

          {/* Matched Highlights Summary */}
          {highlights.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
                Key Extracted Substrings Driving Detection:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[11px]">
                    "{h}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
