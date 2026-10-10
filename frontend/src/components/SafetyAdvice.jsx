import React from 'react';
import { LifeBuoy, Check, PhoneCall, ExternalLink, ShieldAlert } from 'lucide-react';

export default function SafetyAdvice({ advice = [], verdict = 'Likely Safe' }) {
  const isDangerous = verdict === 'Dangerous';
  const isSuspicious = verdict === 'Suspicious';
  const isCannotVerify = verdict === 'CANNOT VERIFY';

  return (
    <div className={`glass-card rounded-2xl p-5 border transition ${
      isDangerous 
        ? 'border-rose-500/30 bg-rose-950/10' 
        : isSuspicious 
        ? 'border-amber-500/30 bg-amber-950/10' 
        : isCannotVerify
        ? 'border-sky-500/30 bg-sky-950/15'
        : 'border-emerald-500/30 bg-emerald-950/10'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
          <LifeBuoy className="w-3.5 h-3.5 text-sky-400" />
          Recommended Safety Actions
        </h4>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          isDangerous
            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            : isSuspicious
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : isCannotVerify
            ? 'text-sky-300 bg-sky-500/10 border-sky-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        }`}>
          {isDangerous ? 'Immediate Action Advised' : isSuspicious ? 'Caution Required' : isCannotVerify ? 'Independent Verification Required' : 'Standard Vigilance'}
        </span>
      </div>

      <ul className="space-y-2 mb-4">
        {advice.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 leading-snug">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isDangerous 
                ? 'bg-rose-500/20 text-rose-400' 
                : isCannotVerify 
                ? 'bg-sky-500/20 text-sky-400' 
                : isSuspicious
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Cyber Crime Helpline banner for high-risk / unverified messages */}
      {(isDangerous || isSuspicious || isCannotVerify) && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">National Cyber Fraud Helpline: </span>
              <a href="tel:1930" className="text-rose-400 font-mono font-bold text-sm hover:underline">1930</a>
              <span className="text-slate-400 ml-1">(Toll Free 24/7 &bull; Golden Hour Support)</span>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline font-medium"
          >
            cybercrime.gov.in
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
