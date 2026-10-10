import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    id: 'demo-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    role: 'Personal Banking Customer',
    affiliation: 'HDFC Bank Account Holder',
    avatar: 'RK',
    avatarBg: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'demo-2',
    name: 'Dr. Neha Sharma',
    email: 'neha.sharma@sbi.co.in',
    role: 'Lead Fraud Risk Investigator',
    affiliation: 'State Bank of India (Cyber Cell)',
    avatar: 'NS',
    avatarBg: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'demo-3',
    name: 'Insp. Vikram Rathore',
    email: 'v.rathore@cybercrime.gov.in',
    role: 'Cyber Crime Nodal Officer',
    affiliation: 'National Cyber Crime Portal (1930)',
    avatar: 'VR',
    avatarBg: 'from-purple-600 to-indigo-600'
  }
];

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [tab, setTab] = useState('demo'); // 'demo' | 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Personal Banking Customer');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    const userProfile = {
      id: 'custom-' + Date.now(),
      name: name || email.split('@')[0],
      email: email,
      role: role,
      affiliation: 'Verified BankShield Member',
      avatar: (name || email.slice(0, 2)).toUpperCase().slice(0, 2),
      avatarBg: 'from-sky-600 to-blue-700'
    };

    onLogin(userProfile);
    onClose();
  };

  const handleDemoSelect = (account) => {
    onLogin(account);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-card bg-[#0b1222] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Sign In to BankShield AI
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access threat intelligence history, sender verification tools, and analyst profiles.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setTab('demo')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'demo'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click Demo Profiles
          </button>
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'signin'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'signup'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Tab 1: Demo Profiles (Instant for judges & hackathons) */}
        {tab === 'demo' && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Choose an identity for quick demonstration:
            </span>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleDemoSelect(acc)}
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-sky-500/40 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${acc.avatarBg} flex items-center justify-center font-bold text-xs text-white shadow-md`}>
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition flex items-center gap-1.5">
                      {acc.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {acc.role.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{acc.affiliation}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Standard Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@bankshield.ai"
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition shadow-lg shadow-sky-900/30 mt-2"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Tab 3: Sign Up */}
        {tab === 'signup' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Verma"
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@bank.com"
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                Role / Purpose
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="Personal Banking Customer">Personal Banking Customer</option>
                <option value="Fraud Risk Analyst">Fraud Risk Analyst</option>
                <option value="Bank Branch Executive">Bank Branch Executive</option>
                <option value="Cyber Safety Investigator">Cyber Safety Investigator</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070c18] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 transition shadow-lg shadow-sky-900/30 mt-2"
            >
              Create Account
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="mt-5 text-center border-t border-slate-800/80 pt-3">
          <p className="text-[11px] text-slate-500">
            Client-side authentication. User profiles and history are stored securely in your browser's private local state.
          </p>
        </div>
      </div>
    </div>
  );
}
