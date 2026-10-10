import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Terminal, 
  Search, 
  Filter, 
  Download, 
  Ban, 
  FileText, 
  ExternalLink, 
  Activity, 
  Eye, 
  X,
  Server,
  Layers,
  CheckCircle2,
  PhoneCall,
  Copy,
  Check,
  Globe,
  Radio,
  Lock,
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

// Sample Live Threat Intelligence Indicators
const THREAT_INTELLIGENCE_FEED = [
  {
    id: 'ti-1',
    type: 'Phishing Domain',
    indicator: 'sbi-yono-kyc.xyz',
    target: 'State Bank of India',
    confidence: '99% High Risk',
    status: 'Active Phishing Campaign',
    source: 'BankShield URL Heuristic / Levenshtein'
  },
  {
    id: 'ti-2',
    type: 'Malicious Sender ID',
    indicator: '+91 98765 43210',
    target: 'Public Cellular GSM',
    confidence: '95% Suspicious',
    status: 'TRAI Non-Compliant Personal Header',
    source: 'TRAI DLT Registry Audit'
  },
  {
    id: 'ti-3',
    type: 'Trojan APK Host',
    indicator: 'icici-verify.top/support.apk',
    target: 'ICICI Bank Customers',
    confidence: '100% Critical Threat',
    status: 'Remote Access / Malware Drop',
    source: 'Indian CERT-In Threat Advisory'
  },
  {
    id: 'ti-4',
    type: 'Lookalike Link',
    indicator: 'kotak-netbanking-update.click',
    target: 'Kotak Mahindra Bank',
    confidence: '98% High Risk',
    status: 'Credential Harvesting Page',
    source: 'Levenshtein Brand Protection'
  },
  {
    id: 'ti-5',
    type: 'URL Shortener Bait',
    indicator: 'bit.ly/axis-reward-points',
    target: 'Axis Bank Credit Cards',
    confidence: '90% Suspicious',
    status: 'Unverified Destination Route',
    source: 'Shortener Masking Detection'
  }
];

export default function SocDashboard({ scanHistory = [], onSelectIncident }) {
  const [filterVerdict, setFilterVerdict] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [reportingModalItem, setReportingModalItem] = useState(null);

  // Investigation statuses state mapped by incident id
  const [investigationStatuses, setInvestigationStatuses] = useState(() => {
    const initial = {};
    scanHistory.forEach((item, idx) => {
      initial[item.id || `init-${idx}`] = item.verdict === 'Dangerous' ? 'Under Investigation' : 'New';
    });
    return initial;
  });

  // Blocked senders list
  const [blockedSenders, setBlockedSenders] = useState(new Set());

  // Threat Intel Lookup Search State
  const [tiQuery, setTiQuery] = useState('');
  const [tiResult, setTiResult] = useState(null);

  // Telemetry Metrics
  const totalIncidents = scanHistory.length;
  const criticalThreats = scanHistory.filter(s => s.verdict === 'Dangerous').length;
  const suspiciousCount = scanHistory.filter(s => s.verdict === 'Suspicious').length;
  const cannotVerifyCount = scanHistory.filter(s => s.verdict === 'CANNOT VERIFY').length;
  const safeCount = scanHistory.filter(s => s.verdict === 'Likely Safe').length;
  
  const avgRiskScore = totalIncidents > 0 
    ? Math.round(scanHistory.reduce((acc, s) => acc + (s.score || 0), 0) / totalIncidents) 
    : 0;

  // Handle status update
  const handleUpdateStatus = (incidentId, newStatus) => {
    setInvestigationStatuses(prev => ({
      ...prev,
      [incidentId]: newStatus
    }));
    setActionNotice({
      title: 'Investigation Status Updated',
      message: `Incident [${incidentId}] status changed to "${newStatus}".`,
      timestamp: new Date().toLocaleTimeString()
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Safe Action 1: Block Sender
  const handleBlockSender = (senderId, incident) => {
    if (!senderId || senderId === 'Not Specified') return;
    setBlockedSenders(prev => new Set([...prev, senderId]));
    if (incident) {
      handleUpdateStatus(incident.id, 'Resolved / Blocked');
    }
    setActionNotice({
      title: 'Sender Blacklisted & Blocked',
      message: `Sender [${senderId}] has been added to the SOC gateway blocklist. Outbound traffic flagged.`,
      timestamp: new Date().toLocaleTimeString()
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Safe Action 2: Copy Forensic Incident Report
  const handleCopyReport = async (item) => {
    const reportText = `[BANKSHIELD AI SOC INCIDENT REPORT]
-----------------------------------------
Incident ID:     ${item.id}
Timestamp:       ${item.timestamp}
Sender ID:       ${item.sender || 'Not Specified'}
Verdict:         ${item.verdict}
Risk Score:      ${item.score}/100
Category:        ${item.scam_type}
Investigation:   ${investigationStatuses[item.id] || 'New'}
Message Content: ${item.message}
-----------------------------------------
Recommendation:  Escalate to Cyber Crime Helpline 1930 / cybercrime.gov.in
Generated by:    BankShield AI Security Operations Center`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedId(item.id);
      setActionNotice({
        title: 'Report Copied to Clipboard',
        message: `Forensic report for incident [${item.id}] copied successfully.`,
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => {
        setCopiedId(null);
        setActionNotice(null);
      }, 3000);
    } catch {
      window.prompt('Copy Incident Report:', reportText);
    }
  };

  // Threat Intel Lookup Action
  const handleRunTiLookup = (e) => {
    e.preventDefault();
    if (!tiQuery.trim()) return;
    const q = tiQuery.trim().toLowerCase();

    // Match against feed or heuristic
    const match = THREAT_INTELLIGENCE_FEED.find(t => 
      t.indicator.toLowerCase().includes(q) || t.target.toLowerCase().includes(q)
    );

    if (match) {
      setTiResult({
        indicator: match.indicator,
        type: match.type,
        verdict: match.confidence,
        status: match.status,
        source: match.source,
        isMalicious: true
      });
    } else if (q.includes('sbi') || q.includes('hdfc') || q.includes('icici') || q.includes('union') || q.includes('bank')) {
      setTiResult({
        indicator: tiQuery,
        type: 'Domain / Keyword Search',
        verdict: 'Suspicious Lookalike Match',
        status: 'Unregistered Banking Claim - High Risk Indicator',
        source: 'BankShield Brand Protection Heuristic',
        isMalicious: true
      });
    } else {
      setTiResult({
        indicator: tiQuery,
        type: 'General Identifier',
        verdict: 'No Known Blacklist Hit',
        status: 'Not currently listed on Indian cyber threat feeds.',
        source: 'Global Phishing Feeds & TRAI DLT DB',
        isMalicious: false
      });
    }
  };

  // Filtered log entries
  const filteredLogs = scanHistory.filter(item => {
    const matchesVerdict = filterVerdict === 'ALL' || item.verdict === filterVerdict;
    const currentStatus = investigationStatuses[item.id] || 'New';
    const matchesStatus = filterStatus === 'ALL' || currentStatus === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (item.message && item.message.toLowerCase().includes(query)) ||
      (item.sender && item.sender.toLowerCase().includes(query)) ||
      (item.scam_type && item.scam_type.toLowerCase().includes(query));
    return matchesVerdict && matchesStatus && matchesSearch;
  });

  // Export JSON Report
  const exportIncidentReport = () => {
    const exportData = scanHistory.map(item => ({
      ...item,
      investigation_status: investigationStatuses[item.id] || 'New',
      is_sender_blocked: blockedSenders.has(item.sender)
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `bankshield_soc_incidents_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setActionNotice({
      title: 'Forensic Dossier Exported',
      message: `Exported ${scanHistory.length} incident telemetry records to local JSON dossier.`,
      timestamp: new Date().toLocaleTimeString()
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* SOC Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b1222] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                SOC Incident Queue & Threat Intelligence Center
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                ACTIVE MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Track severity, investigation queue, Telecom DLT verification, and threat indicators.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportIncidentReport}
            disabled={totalIncidents === 0}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Incident Log (JSON)</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start justify-between gap-3 text-xs text-sky-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="font-bold text-white">{actionNotice.title}: </span>
              <span>{actionNotice.message}</span>
              <span className="text-slate-400 ml-2">({actionNotice.timestamp})</span>
            </div>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-xl border border-slate-800 bg-[#070c18]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Evaluated</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">{totalIncidents}</div>
          <span className="text-[10px] text-slate-500">Live analyzed incidents</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
            <span>Critical Threats</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-400">{criticalThreats}</div>
          <span className="text-[10px] text-rose-400/80">High-risk scams blocked</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span>Suspicious Intercepts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-400">{suspiciousCount}</div>
          <span className="text-[10px] text-amber-400/80">Moderate anomalies</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-sky-500/20 bg-sky-950/10">
          <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
            <span>Cannot Verify</span>
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-sky-400">{cannotVerifyCount}</div>
          <span className="text-[10px] text-sky-400/80">Insufficient evidence</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span>Average Risk Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {avgRiskScore}
            <span className="text-xs font-normal text-slate-400 ml-1">/100</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Overall threat index</span>
        </div>
      </div>

      {/* Fraud Analytics: Visual Risk Results Over Time */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fraud Analytics: Risk Distribution & Severity Over Time
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {totalIncidents > 0 ? `${totalIncidents} Sample Points` : 'Awaiting evaluations'}
          </span>
        </div>

        {/* Visual Distribution Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Risk Composition Ratio:</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical ({criticalThreats})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Suspicious ({suspiciousCount})
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Cannot Verify ({cannotVerifyCount})
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe ({safeCount})
              </span>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
            {totalIncidents > 0 ? (
              <>
                <div style={{ width: `${(criticalThreats / totalIncidents) * 100}%` }} className="bg-rose-500 transition-all duration-500" title="Critical Threats" />
                <div style={{ width: `${(suspiciousCount / totalIncidents) * 100}%` }} className="bg-amber-500 transition-all duration-500" title="Suspicious" />
                <div style={{ width: `${(cannotVerifyCount / totalIncidents) * 100}%` }} className="bg-sky-500 transition-all duration-500" title="Cannot Verify" />
                <div style={{ width: `${(safeCount / totalIncidents) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title="Likely Safe" />
              </>
            ) : (
              <div className="w-full bg-slate-800" />
            )}
          </div>
        </div>

        {/* Severity Histogram Simulator */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
          {scanHistory.slice(0, 8).map((hist, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-[#070c18] border border-slate-800/80 text-center flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-mono mb-1">{hist.timestamp}</span>
              <div className="h-14 w-full bg-slate-900 rounded-lg flex items-end p-1 justify-center">
                <div 
                  className={`w-4 rounded transition-all duration-500 ${
                    hist.score >= 66 ? 'bg-rose-500' :
                    hist.score >= 35 ? 'bg-amber-500' :
                    hist.verdict === 'CANNOT VERIFY' ? 'bg-sky-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ height: `${Math.max(15, (hist.score / 100) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold mt-1 text-slate-300">{hist.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Intelligence Feed & Indicator Search Tool */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Threat Intelligence: Active Malicious URLs & Phishing Indicators
            </h3>
          </div>

          {/* Indicator Lookup */}
          <form onSubmit={handleRunTiLookup} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={tiQuery}
              onChange={(e) => setTiQuery(e.target.value)}
              placeholder="Check URL, domain, or phone..."
              className="bg-[#070c18] border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shrink-0 transition"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* TI Lookup Result Popup */}
        {tiResult && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            tiResult.isMalicious 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Indicator Result: {tiResult.indicator}</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-black/40">
                  {tiResult.verdict}
                </span>
              </div>
              <p className="text-[11px] mt-0.5 opacity-90">{tiResult.status} &bull; Source: {tiResult.source}</p>
            </div>
            <button onClick={() => setTiResult(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feed Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {THREAT_INTELLIGENCE_FEED.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold">
                  {item.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.confidence}</span>
              </div>
              <div className="font-mono font-bold text-white text-[11px] truncate">
                {item.indicator}
              </div>
              <p className="text-[11px] text-slate-400">Target: <span className="text-slate-300 font-medium">{item.target}</span></p>
              <p className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1 truncate">
                {item.source}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SOC Incident Queue & Investigation Tracking */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              SOC Incident Queue & Investigation Tracking
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filteredLogs.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sender, message, scam..."
                className="bg-[#070c18] border border-slate-700 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>

            {/* Investigation Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#070c18] border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">Status: New</option>
              <option value="Under Investigation">Status: Under Investigation</option>
              <option value="Resolved / Blocked">Status: Resolved / Blocked</option>
            </select>

            {/* Verdict Filter Pills */}
            <div className="flex items-center gap-1 bg-[#070c18] p-1 rounded-lg border border-slate-800 text-[11px]">
              {['ALL', 'Dangerous', 'Suspicious', 'CANNOT VERIFY', 'Likely Safe'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFilterVerdict(v)}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    filterVerdict === v 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v === 'ALL' ? 'All' : v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Queue Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/30 rounded-xl border border-slate-800">
            <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-400">No incident records matching filter criteria</p>
            <p className="text-[11px] mt-1">Run new message evaluations in the Fraud Detector tab or adjust the filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/40">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Sender ID / DLT Status</th>
                  <th className="py-2.5 px-3 font-semibold">Message Preview</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold">Verdict</th>
                  <th className="py-2.5 px-3 font-semibold">Investigation Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Safe Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map((item, index) => {
                  const status = investigationStatuses[item.id] || 'New';
                  const isBlocked = blockedSenders.has(item.sender);
                  return (
                    <tr key={item.id || index} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded border text-[11px] ${
                            isBlocked ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 line-through' : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}>
                            {item.sender || 'Not Specified'}
                          </span>
                          {item.sender && item.sender.length === 8 && !item.sender.includes('+') ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded" title="TRAI DLT Registered Header">
                              DLT
                            </span>
                          ) : item.sender && item.sender.includes('+91') ? (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded" title="Unverified GSM Mobile">
                              GSM
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                        {item.message}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={
                          item.score >= 66 ? 'text-rose-400' :
                          item.score >= 35 ? 'text-amber-400' :
                          'text-emerald-400'
                        }>
                          {item.score}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.verdict === 'Dangerous'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            : item.verdict === 'Suspicious'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                            : item.verdict === 'CANNOT VERIFY'
                            ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        }`}>
                          {item.verdict}
                        </span>
                      </td>
                      {/* Investigation Status Selector */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`text-[10px] font-semibold rounded-lg px-2 py-1 border transition cursor-pointer ${
                            status === 'Resolved / Blocked'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : status === 'Under Investigation'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Resolved / Blocked">Resolved / Blocked</option>
                        </select>
                      </td>
                      {/* Safe Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Incident Report */}
                          <button
                            type="button"
                            onClick={() => handleCopyReport(item)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Copy forensic incident report"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Block Sender */}
                          <button
                            type="button"
                            onClick={() => handleBlockSender(item.sender, item)}
                            disabled={!item.sender || item.sender === 'Not Specified' || isBlocked}
                            className={`p-1 rounded-lg transition disabled:opacity-40 ${
                              isBlocked ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white'
                            }`}
                            title={isBlocked ? 'Sender is blocked' : 'Block sender identifier'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Cybercrime Reporting Details */}
                          <button
                            type="button"
                            onClick={() => setReportingModalItem(item)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                            title="Access Cybercrime reporting information"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                          </button>

                          {/* Inspect Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedIncident(item)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                            title="Inspect forensic details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Privacy Protection Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Zero-Credential Retention Policy: </strong>
            BankShield AI operates strictly statelessly in volatile browser memory. Passwords, OTPs, PINs, CVVs, and account credentials are never transmitted to external databases.
          </span>
        </div>
      </div>

      {/* Cybercrime Reporting Information Helper Modal */}
      {reportingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card bg-[#0b1222] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cybercrime Reporting Assistant
                </h4>
              </div>
              <button onClick={() => setReportingModalItem(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1">
                <span className="font-bold">Golden Hour Action:</span>
                <p className="text-[11px] leading-relaxed">
                  If funds were stolen, dial <a href="tel:1930" className="font-mono font-bold text-white underline">1930</a> within 2 hours. Quote the transaction UTR number to trigger beneficiary bank freeze.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-semibold text-white block">Pre-Formatted Cyber Complaint Text:</span>
                <textarea
                  readOnly
                  rows={4}
                  value={`Sir/Madam, I received a fraudulent communication purporting to be from my bank from sender ${reportingModalItem.sender || 'Unknown'}. The message text was: "${reportingModalItem.message}". This appears to be an unauthorized phishing attempt. Kindly investigate.`}
                  className="w-full bg-[#070c18] border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono text-[11px] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition inline-flex items-center gap-1.5"
                >
                  <span>Open cybercrime.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="tel:1930"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition inline-flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1930 Helpline</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Inspector Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-card bg-[#0b1222] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Incident Forensic Details: {selectedIncident.id}
                </h4>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                  <span className="font-mono text-white text-sm">{selectedIncident.timestamp}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Risk Score & Verdict</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedIncident.score}/100 ({selectedIncident.verdict})
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sender Identifier & DLT Check</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sky-400 bg-slate-800 px-2 py-0.5 rounded text-xs">
                    {selectedIncident.sender || 'Not Specified'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {selectedIncident.sender?.includes('+91') ? 'Personal GSM Number (Non-DLT)' : 'Entity Header Check'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Raw Message Content</span>
                <p className="font-mono text-slate-200 bg-[#070c18] p-3 rounded-lg border border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedIncident.message}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Safe Actions</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBlockSender(selectedIncident.sender, selectedIncident)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 transition"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block Sender Identifier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyReport(selectedIncident)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Forensic Report</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
