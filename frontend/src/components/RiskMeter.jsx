import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function RiskMeter({ score, verdict, scamType }) {
  // Semicircle gauge metrics
  // Angle: from -90 deg (score 0) to +90 deg (score 100)
  const needleAngle = -90 + (score / 100) * 180;

  // Arc length for radius 70: pi * 70 = 219.91
  const arcLength = 220;
  const strokeOffset = arcLength - (arcLength * score) / 100;

  let theme = {
    color: '#10b981',
    glow: 'glow-emerald',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    title: 'Likely Safe',
    icon: ShieldCheck,
    barGradient: 'url(#safeGradient)'
  };

  if (verdict === 'CANNOT VERIFY') {
    theme = {
      color: '#38bdf8',
      glow: 'glow-sky',
      badgeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      title: 'CANNOT VERIFY',
      icon: HelpCircle,
      barGradient: 'url(#unverifiedGradient)'
    };
  } else if (score > 65 || verdict === 'Dangerous') {
    theme = {
      color: '#ef4444',
      glow: 'glow-rose',
      badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      title: 'Dangerous',
      icon: AlertOctagon,
      barGradient: 'url(#dangerGradient)'
    };
  } else if (score > 30 || verdict === 'Suspicious') {
    theme = {
      color: '#f59e0b',
      glow: 'glow-amber',
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      title: 'Suspicious',
      icon: AlertTriangle,
      barGradient: 'url(#warnGradient)'
    };
  }

  const VerdictIcon = theme.icon;

  return (
    <div className={`glass-card rounded-2xl p-6 text-center shadow-xl border border-slate-800 ${theme.glow} transition-all duration-500`}>
      <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-2">
        Fraud Risk Assessment
      </h3>

      {/* Semicircle Gauge SVG */}
      <div className="relative w-56 h-32 mx-auto mt-2">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="bgArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="warnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="unverifiedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Active Arc */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke={theme.barGradient}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            }}
          />

          {/* Center Pivot Point */}
          <circle cx="100" cy="105" r="7" fill="#0f172a" stroke={theme.color} strokeWidth="3" />

          {/* Needle Indicator */}
          <g
            transform={`rotate(${needleAngle}, 100, 105)`}
            style={{
              transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <line
              x1="100"
              y1="105"
              x2="100"
              y2="38"
              stroke={theme.color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="38" r="3" fill={theme.color} />
          </g>

          {/* Tick labels */}
          <text x="22" y="122" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="600">0</text>
          <text x="100" y="24" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="600">50</text>
          <text x="178" y="122" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="600">100</text>
        </svg>

        {/* Floating Numeric Score Badge */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <div className="text-4xl font-extrabold tracking-tight font-mono" style={{ color: theme.color }}>
            {score}
            <span className="text-sm font-normal text-slate-400 ml-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Verdict & Scam Type Badges */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${theme.badgeBg}`}>
          <VerdictIcon className="w-3.5 h-3.5" />
          <span>Verdict: {verdict}</span>
        </div>

        {scamType && (
          <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60 font-medium">
            Category: <span className="text-slate-200">{scamType}</span>
          </div>
        )}

        {verdict === 'CANNOT VERIFY' && (
          <p className="text-[11px] text-sky-400/80 max-w-xs mt-1">
            Insufficient Evidence: Message lacks standard bank transaction structure, reference number, or verified TRAI DLT header.
          </p>
        )}
      </div>
    </div>
  );
}
