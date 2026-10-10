import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle,
  Sparkles, 
  Send, 
  Trash2, 
  Clipboard, 
  PhoneCall, 
  Mic, 
  MicOff,
  Volume2,
  Check
} from 'lucide-react';

const SAMPLES = [
  {
    id: 'gen-1',
    label: 'SBI UPI Debit Alert',
    category: 'Normal / Genuine',
    type: 'genuine',
    sender: 'AD-SBIINB',
    text: 'Dear Customer, INR 1,250.00 debited from A/C XX4321 on 09-OCT-26 via UPI txn to Swiggy. Ref 429384918234. If not done by you, call 1800112211 - State Bank of India'
  },
  {
    id: 'gen-2',
    label: 'HDFC Salary Credit',
    category: 'Normal / Genuine',
    type: 'genuine',
    sender: 'VK-HDFCBK',
    text: 'Salary of INR 75,000.00 credited to your HDFC Bank A/C ending 9876 on 01-OCT-26 by XYZ TECH PVT LTD. Avail balance INR 82,340.50. Check details on NetBanking.'
  },
  {
    id: 'scam-1',
    label: 'SBI YONO Phishing Link',
    category: 'Suspicious / Scam',
    type: 'scam',
    sender: '+91 98765 43210',
    text: 'Dear Customer, your SBI account blocked today! Click http://sbi-yono-kyc.xyz to update your PAN and unblock your account within 24 hours.'
  },
  {
    id: 'scam-2',
    label: 'HDFC Card OTP Solicitation',
    category: 'Suspicious / Scam',
    type: 'scam',
    sender: '+91 88234 56789',
    text: 'Dear customer your HDFC debit card has been suspended. Call back and share your OTP with executive to verify card details and reactivate.'
  },
  {
    id: 'amb-1',
    label: 'Generic Account Verification',
    category: 'Ambiguous (Cannot Verify)',
    type: 'ambiguous',
    sender: '+91 91234 56780',
    text: 'Hello, please verify your account details today. Call me back.'
  },
  {
    id: 'amb-2',
    label: 'Transaction Inquiry Without Bank ID',
    category: 'Ambiguous (Cannot Verify)',
    type: 'ambiguous',
    sender: '',
    text: 'Hi Rajesh, please confirm your recent transaction by replying YES or NO.'
  }
];

export default function MessageInput({ 
  message, 
  setMessage, 
  sender, 
  setSender, 
  onAnalyze, 
  isLoading 
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Default Indian English

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setMessage(prev => (prev ? prev + ' ' + transcript : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        setSpeechError(`Speech error: ${event.error}`);
        setIsRecording(false);
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setMessage]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setSpeechError('Could not start microphone. Check browser permissions.');
        setIsRecording(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && message.trim()) {
        onAnalyze();
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      // Fallback for restricted clipboard
      const promptText = window.prompt('Paste your bank message here:');
      if (promptText) setMessage(promptText);
    }
  };

  const handleApplySample = (sample) => {
    setMessage(sample.text);
    if (setSender) setSender(sample.sender || '');
  };

  const filteredSamples = selectedFilter === 'all' 
    ? SAMPLES 
    : SAMPLES.filter(s => s.type === selectedFilter);

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 shadow-xl border border-slate-800 space-y-4">
      {/* Sender Identifier Field */}
      <div className="bg-[#0b1222]/90 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="sender-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
            Sender ID, Phone or SMS Header (Optional)
          </label>
          <span className="text-[11px] text-slate-500 font-mono">e.g. AD-SBIINB or +91 9876543210</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="sender-input"
            type="text"
            value={sender || ''}
            onChange={(e) => setSender && setSender(e.target.value)}
            placeholder="Enter sender header (e.g. VK-HDFCBK, AD-UBINBK, or personal number)"
            className="flex-1 bg-[#070c18] border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          {sender && (
            <button
              type="button"
              onClick={() => setSender && setSender('')}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-2 rounded-lg bg-slate-800 transition"
              title="Clear sender"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Message Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="message-input" className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Paste Bank SMS or WhatsApp Message
          </label>
          <div className="flex items-center gap-2">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                isRecording 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
              }`}
              title="Speak or dictate message"
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-sky-400" />}
              <span>{isRecording ? 'Listening...' : 'Speak'}</span>
            </button>

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
              title="Paste from clipboard"
            >
              {pasteSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
            </button>

            {/* Clear Button */}
            {message && (
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  if (setSender) setSender('');
                }}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {speechError && (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg mb-2">
            {speechError}
          </div>
        )}

        <div className="relative">
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste SMS here (e.g. 'Dear customer your SBI account is blocked! Click http://sbi-kyc.xyz to update PAN...')"
            rows={4}
            className="w-full bg-[#0b1222] border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-sm md:text-base resize-none font-sans leading-relaxed transition"
          />
          <div className="flex justify-between items-center mt-1 text-xs text-slate-500 px-1">
            <span>Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400 border border-slate-700">Ctrl + Enter</kbd> to analyze</span>
            <span>{message.length} characters</span>
          </div>
        </div>
      </div>

      {/* Demonstration Test Scenarios: Normal, Suspicious & Ambiguous (Priority 3) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Demonstration Test Cases (Priority 3):
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-2 py-0.5 rounded-md transition ${selectedFilter === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('genuine')}
              className={`px-2 py-0.5 rounded-md transition ${selectedFilter === 'genuine' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              Normal (Safe)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('scam')}
              className={`px-2 py-0.5 rounded-md transition ${selectedFilter === 'scam' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              Suspicious (Scam)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ambiguous')}
              className={`px-2 py-0.5 rounded-md transition ${selectedFilter === 'ambiguous' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              Ambiguous (Cannot Verify)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleApplySample(sample)}
              className={`text-left text-xs p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                sample.type === 'genuine'
                  ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300'
                  : sample.type === 'ambiguous'
                  ? 'border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300'
                  : 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300'
              }`}
            >
              {sample.type === 'genuine' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : sample.type === 'ambiguous' ? (
                <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="truncate flex-1">
                <div className="font-semibold flex items-center justify-between">
                  <span>{sample.label}</span>
                  {sample.sender && (
                    <span className="font-mono text-[10px] opacity-75 bg-slate-900/60 px-1.5 py-0.2 rounded border border-slate-800">
                      {sample.sender}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate opacity-90">{sample.text}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !message.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning message, URLs, sender header & telecom routing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              <span>Analyze Message Risk & Sender Authenticity</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
