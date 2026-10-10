import React from 'react';
import { 
  AlertTriangle, 
  Key, 
  Globe, 
  DownloadCloud, 
  PhoneCall, 
  Clock, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';

function getWarningIcon(type) {
  switch (type) {
    case 'credential':
      return <Key className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'urgent':
      return <Clock className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'remote_app':
      return <DownloadCloud className="w-4 h-4 text-purple-400 shrink-0" />;
    case 'lookalike_domain':
    case 'insecure_http':
    case 'suspicious_tld':
    case 'url_shortener':
    case 'ip_host':
      return <Globe className="w-4 h-4 text-sky-400 shrink-0" />;
    case 'unverified_contact':
    case 'sender_spoof':
      return <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'insufficient_evidence':
      return <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
  }
}

export default function WarningList({ warnings = [] }) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          Detected Warning Signals
        </h4>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Zero malicious triggers detected. Message exhibits no known phishing signals.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Detected Warning Signals
        </h4>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
          {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2.5">
        {warnings.map((w, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="mt-0.5">{getWarningIcon(w.type)}</div>
            <div className="text-sm text-slate-200 leading-relaxed font-sans">
              {w.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
