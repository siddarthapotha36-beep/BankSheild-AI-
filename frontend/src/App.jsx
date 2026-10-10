import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  AlertCircle, 
  RefreshCw, 
  User, 
  LogIn, 
  Compass, 
  History,
  Building2,
  Activity,
  PhoneCall,
  Volume2
} from 'lucide-react';
import MessageInput from './components/MessageInput';
import RiskMeter from './components/RiskMeter';
import HighlightedText from './components/HighlightedText';
import WarningList from './components/WarningList';
import SafetyAdvice from './components/SafetyAdvice';
import SenderLocationCard from './components/SenderLocationCard';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
import SocDashboard from './components/SocDashboard';
import BankDirectory from './components/BankDirectory';
import PoliceDirectory from './components/PoliceDirectory';
import VoiceAssistant from './components/VoiceAssistant';
import ExplainableAiCard from './components/ExplainableAiCard';
import { analyzeMessage } from './api/client';


const DEFAULT_USER = {
  id: 'demo-1',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@gmail.com',
  role: 'Personal Banking Customer',
  affiliation: 'HDFC Bank Account Holder',
  avatar: 'RK',
  avatarBg: 'from-blue-600 to-cyan-600'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('detector'); // 'detector', 'soc', 'banks', 'police'
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bankshield_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scan Activity History State (Saved locally, Zero server storage)
  const [scanHistory, setScanHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('bankshield_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Pre-populate with initial demonstration history records
    return [
      {
        id: 'scan-init-1',
        timestamp: '11:42 AM',
        message: 'Dear Customer, your SBI account blocked today! Click http://sbi-yono-kyc.xyz to update your PAN and unblock your account within 24 hours.',
        sender: '+91 98765 43210',
        score: 75,
        verdict: 'Dangerous',
        scam_type: 'Lookalike Bank Impersonation'
      },
      {
        id: 'scan-init-2',
        timestamp: '11:45 AM',
        message: 'Hello, please verify your account details today. Call me back.',
        sender: '+91 91234 56780',
        score: 40,
        verdict: 'CANNOT VERIFY',
        scam_type: 'Ambiguous / Insufficient Evidence'
      },
      {
        id: 'scan-init-3',
        timestamp: '11:48 AM',
        message: 'Dear Customer, INR 1,250.00 debited from A/C XX4321 on 09-OCT-26 via UPI txn to Swiggy. Ref 429384918234. - State Bank of India',
        sender: 'AD-SBIINB',
        score: 0,
        verdict: 'Likely Safe',
        scam_type: 'Genuine Banking Notification'
      }
    ];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bankshield_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bankshield_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bankshield_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeMessage(message, sender);
      setAnalysisResult(data);

      // Save to local device scan history
      const newHistoryItem = {
        id: 'scan-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: message.trim(),
        sender: sender.trim() || data.sender_details?.raw_sender || 'Not Specified',
        score: data.risk_score,
        verdict: data.verdict,
        scam_type: data.scam_type
      };

      setScanHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
    } catch (err) {
      setError(err.message || 'An error occurred during message analysis. Please verify backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setSender('');
    setAnalysisResult(null);
    setError(null);
  };

  const handleSelectHistory = (item) => {
    setMessage(item.message);
    setSender(item.sender && item.sender !== 'Not Specified' ? item.sender : '');
    handleReset();
    setMessage(item.message);
    setActiveTab('detector');
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0b1222]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('detector')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  BankShield AI
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  National Security Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                3-Layer AI Fraud & Phishing Detection with Telecom DLT Sender Verification
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#070c18] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('detector')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'detector'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fraud Detector</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('soc')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'soc'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>SOC Dashboard</span>
              {scanHistory.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {scanHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('banks')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'banks'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('police')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'police'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Police & 1930</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick 1930 Dial Badge */}
            <a
              href="tel:1930"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
              title="Call National Cyber Crime Helpline 1930"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>1930 (24x7)</span>
            </a>

            {activeTab === 'detector' && analysisResult && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition"
                title="Start a new message analysis"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Analysis</span>
              </button>
            )}

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition"
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentUser.avatarBg || 'from-sky-500 to-blue-600'} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role.split(' ')[0]}</div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition shadow-md shadow-sky-900/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-[#070c18] px-2 py-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('detector')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
              activeTab === 'detector' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Detector</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('soc')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
              activeTab === 'soc' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SOC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('banks')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
              activeTab === 'banks' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Banks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('police')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
              activeTab === 'police' ? 'bg-rose-600 text-white' : 'text-rose-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Police</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Tab 1: Main Fraud Detector */}
        {activeTab === 'detector' && (
          <div className="space-y-6">
            {/* Intro Tagline */}
            <div className="text-center max-w-2xl mx-auto mb-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Verify Bank Messages & Senders in Real-Time
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Instant fraud scoring for SMS and WhatsApp. Analyzes TRAI DLT headers, lookalike bank URLs, and returns <span className="font-semibold text-sky-400">CANNOT VERIFY</span> when evidence is insufficient.
              </p>
            </div>

            {/* Input Card */}
            <MessageInput
              message={message}
              setMessage={setMessage}
              sender={sender}
              setSender={setSender}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">Analysis Error</p>
                  <p className="text-rose-300/90 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {analysisResult && (
              <div className="space-y-6 pt-2 animate-fadeIn">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-sky-400">
                    Security Intelligence Report
                  </h3>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                {/* Multilingual Voice Assistant Banner */}
                <VoiceAssistant analysisResult={analysisResult} />

                {/* Sender & Receiver Geolocation Intelligence Card */}
                {(analysisResult.sender_details || analysisResult.location_details) && (
                  <SenderLocationCard
                    senderDetails={analysisResult.sender_details}
                    locationDetails={analysisResult.location_details}
                  />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Risk Meter & Original Message Breakdown */}
                  <div className="lg:col-span-5 space-y-6">
                    <RiskMeter
                      score={analysisResult.risk_score}
                      verdict={analysisResult.verdict}
                      scamType={analysisResult.scam_type}
                    />
                    <HighlightedText
                      text={message}
                      highlights={analysisResult.highlights}
                    />
                  </div>

                  {/* Right Column: Warnings & Actionable Advice */}
                  <div className="lg:col-span-7 space-y-6">
                    <WarningList warnings={analysisResult.warnings} />
                    <SafetyAdvice
                      advice={analysisResult.advice}
                      verdict={analysisResult.verdict}
                    />
                  </div>
                </div>

                {/* Explainable AI (XAI) Transparent Decision Breakdown */}
                <ExplainableAiCard
                  analysisResult={analysisResult}
                  rawMessage={message}
                />
              </div>
            )}
          </div>
        )}


        {/* Tab 2: Priority 2 — SOC Incident Dashboard */}
        {activeTab === 'soc' && (
          <SocDashboard 
            scanHistory={scanHistory}
            onSelectIncident={handleSelectHistory}
          />
        )}

        {/* Tab 3: Priority 3 — Indian Bank Contact Directory & Branch Locator */}
        {activeTab === 'banks' && (
          <BankDirectory />
        )}

        {/* Tab 4: Police Stations & Emergency 1930 Help */}
        {activeTab === 'police' && (
          <PoliceDirectory />
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
        scanHistory={scanHistory}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090e1c] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Storage Guarantee: Messages are evaluated ephemerally in volatile memory. No user credentials stored remotely.</span>
          </div>
          <div className="text-slate-400 flex items-center gap-3">
            <span>National Cyber Crime Helpline: <a href="tel:1930" className="text-rose-400 font-mono font-bold hover:underline">1930</a></span>
            <span>&bull;</span>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400">cybercrime.gov.in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
