import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PhoneCall, 
  ExternalLink, 
  MapPin, 
  ShieldCheck, 
  Search, 
  Navigation, 
  Lock, 
  Smartphone, 
  AlertCircle 
} from 'lucide-react';
import { fetchBanks } from '../api/client';

export default function BankDirectory() {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('union_bank');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityInput, setCityInput] = useState('');

  useEffect(() => {
    async function loadBanks() {
      const data = await fetchBanks();
      if (data && data.length > 0) {
        setBanks(data);
      }
    }
    loadBanks();
  }, []);

  const filteredBanks = banks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBank = banks.find(b => b.id === selectedBankId) || banks[0];

  const handleOpenGoogleMapsBranches = () => {
    if (!selectedBank) return;
    const query = cityInput.trim() 
      ? `${selectedBank.name} branch in ${cityInput.trim()}`
      : `${selectedBank.name} branch near me`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  const handleOpenGoogleMapsATMs = () => {
    if (!selectedBank) return;
    const query = cityInput.trim() 
      ? `${selectedBank.name} ATM in ${cityInput.trim()}`
      : `${selectedBank.name} ATM near me`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b1222] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Verified Indian Bank Contact Directory & Branch Locator
            </h2>
            <p className="text-xs text-slate-400">
              Official toll-free hotlines, dedicated cyber fraud reporting, DLT sender IDs, and Google Maps branch locations.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bank (e.g. Union Bank, SBI, HDFC)..."
            className="bg-[#070c18] border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Main Grid: Bank Selector & Detailed Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bank Selection List */}
        <div className="lg:col-span-4 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Select Indian Bank:
          </span>

          {filteredBanks.map((bank) => {
            const isSelected = selectedBank?.id === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBankId(bank.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-500/60 bg-sky-500/10 text-white shadow-md shadow-sky-900/20'
                    : 'border-slate-800 bg-[#0b1222] text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm`}
                    style={{ backgroundColor: bank.color || '#0284c7' }}
                  >
                    {bank.code || bank.short_name.substring(0, 3)}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs leading-snug">{bank.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{bank.category}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800 shrink-0">
                  {bank.toll_free ? '24/7' : 'Active'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Bank Details & Google Maps Branch Finder */}
        {selectedBank && (
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            {/* Bank Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm text-white shadow-xl"
                  style={{ backgroundColor: selectedBank.color || '#0284c7' }}
                >
                  {selectedBank.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{selectedBank.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      RBI Scheduled Bank
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedBank.category}</p>
                </div>
              </div>

              <a
                href={selectedBank.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-xl border border-sky-500/30 font-semibold transition self-start sm:self-center"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Contact Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Customer Care */}
              <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                  Official Customer Care Toll-Free
                </div>
                <div className="text-base font-bold font-mono text-white">
                  <a href={`tel:${selectedBank.toll_free.replace(/\s+/g, '')}`} className="hover:text-sky-400 transition">
                    {selectedBank.toll_free}
                  </a>
                </div>
                {selectedBank.alternate_care && (
                  <p className="text-[11px] text-slate-400">
                    Alt: <span className="text-slate-300 font-mono">{selectedBank.alternate_care}</span>
                  </p>
                )}
              </div>

              {/* Dedicated Cyber Fraud Helpline */}
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold uppercase text-[10px] tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Dedicated Cyber Fraud Hotline
                </div>
                <div className="text-sm font-bold text-rose-300 font-sans leading-snug">
                  {selectedBank.fraud_helpline}
                </div>
                {selectedBank.sms_block_code && (
                  <p className="text-[11px] text-slate-400">
                    Emergency SMS: <span className="font-mono text-rose-400 font-semibold">{selectedBank.sms_block_code}</span>
                  </p>
                )}
              </div>

              {/* NetBanking URL */}
              <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Verified NetBanking Portal
                </div>
                <div className="font-mono text-xs text-emerald-400 truncate">
                  <a href={selectedBank.netbanking_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {selectedBank.netbanking_url}
                  </a>
                </div>
                <p className="text-[10px] text-slate-500">
                  Always verify https:// and the official domain spelling before typing password.
                </p>
              </div>

              {/* Official Mobile App & TRAI Senders */}
              <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  Official Mobile App
                </div>
                <div className="font-bold text-slate-200">
                  {selectedBank.official_app}
                </div>
                <div className="text-[11px] text-slate-400">
                  <span>DLT SMS Senders: </span>
                  <span className="font-mono text-sky-400">
                    {selectedBank.dlt_senders ? selectedBank.dlt_senders.join(', ') : 'Registered TRAI'}
                  </span>
                </div>
              </div>
            </div>

            {/* Google Maps Branch & ATM Locator Section */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/30 via-slate-900 to-indigo-950/30 border border-sky-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Locate {selectedBank.name} Branches & ATMs on Google Maps
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter city, area, or pin code (e.g. Mumbai, Connaught Place)..."
                    className="w-full bg-[#070c18] border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenGoogleMapsBranches}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-sky-600 hover:bg-sky-500 flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-900/30"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find Branches on Maps</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenGoogleMapsATMs}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Find ATMs on Maps</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Opens direct Google Maps search with navigation directions and live branch operating hours.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
