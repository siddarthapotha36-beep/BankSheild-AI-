import React from 'react';
import { 
  X, 
  LogOut, 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  User, 
  Building2,
  ExternalLink 
} from 'lucide-react';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  scanHistory = [], 
  onSelectHistory, 
  onClearHistory 
}) {
  if (!isOpen || !user) return null;

  // Calculate stats from scanHistory
  const totalScans = scanHistory.length;
  const dangerousCount = scanHistory.filter(s => s.verdict === 'Dangerous').length;
  const suspiciousCount = scanHistory.filter(s => s.verdict === 'Suspicious').length;
  const safeCount = scanHistory.filter(s => s.verdict === 'Likely Safe').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-card bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-slate-800">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${user.avatarBg || 'from-sky-500 to-blue-600'} flex items-center justify-center text-xl font-bold text-white shadow-xl shrink-0`}>
            {user.avatar || 'US'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">{user.name}</h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 w-fit mx-auto sm:mx-0">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            <p className="text-xs text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              {user.affiliation}
            </p>
          </div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition self-center sm:self-start"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Security Scan Overview Metrics */}
        <div className="grid grid-cols-4 gap-2.5 my-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Scans</span>
            <span className="text-lg font-extrabold text-white font-mono">{totalScans}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Dangerous</span>
            <span className="text-lg font-extrabold text-rose-400 font-mono">{dangerousCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Suspicious</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">{suspiciousCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Likely Safe</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{safeCount}</span>
          </div>
        </div>

        {/* Scan Activity History Section */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-sky-400" />
              Recent Scan Activity (Local Device Only)
            </h4>
            {scanHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {scanHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
              No recent messages scanned on this device yet.
            </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#070c18] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.verdict === 'Dangerous'
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : item.verdict === 'Suspicious'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      }`}>
                        {item.score}/100 - {item.verdict}
                      </span>
                      {item.sender && (
                        <span className="text-slate-400 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.sender}
                        </span>
                      )}
                      <span className="text-slate-500 text-[10px] ml-auto">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-300 truncate font-mono text-[11px]">
                      {item.message}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    title="Load message into analyzer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-400 hover:text-white transition shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Privacy Policy: History is stored strictly in your browser's local cache. BankShield AI never stores messages remotely.
        </div>
      </div>
    </div>
  );
}
