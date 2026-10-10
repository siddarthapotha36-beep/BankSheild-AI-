import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  Navigation, 
  ExternalLink, 
  Clock, 
  Mail, 
  FileText, 
  AlertOctagon, 
  CheckCircle2, 
  Compass, 
  Building,
  HelpCircle,
  Share2
} from 'lucide-react';
import { fetchPoliceStations } from '../api/client';

export default function PoliceDirectory() {
  const [directoryData, setDirectoryData] = useState(null);
  const [selectedCityKey, setSelectedCityKey] = useState('mumbai');
  const [geoState, setGeoState] = useState({ loading: false, error: null, coords: null });

  useEffect(() => {
    async function loadDirectory() {
      const data = await fetchPoliceStations();
      if (data) {
        setDirectoryData(data);
      }
    }
    loadDirectory();
  }, []);

  const cityStations = directoryData?.city_stations || {};
  const cityKeys = Object.keys(cityStations);
  const selectedStation = cityStations[selectedCityKey] || Object.values(cityStations)[0];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({ loading: false, error: 'Geolocation is not supported by your browser.', coords: null });
      return;
    }

    setGeoState({ loading: true, error: null, coords: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoState({
          loading: false,
          error: null,
          coords: { latitude, longitude }
        });

        // Open Google Maps centered on user's live coordinates looking for nearby cyber police stations
        const mapsNearMeUrl = `https://www.google.com/maps/search/?api=1&query=Cyber+Crime+Police+Station+near+me`;
        window.open(mapsNearMeUrl, '_blank');
      },
      (error) => {
        let msg = 'Could not access location.';
        if (error.code === 1) msg = 'Location permission was denied. You can still browse all city stations below.';
        else if (error.code === 2) msg = 'Location unavailable.';
        else if (error.code === 3) msg = 'Location request timed out.';
        setGeoState({ loading: false, error: msg, coords: null });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b1222] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cyber Crime Police Station Locator & Emergency Assistance
            </h2>
            <p className="text-xs text-slate-400">
              Find 24/7 state cyber cells, dial national emergency helplines, and access official Zero FIR complaint filing guides.
            </p>
          </div>
        </div>

        {/* GPS Geolocation Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={geoState.loading}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 flex items-center gap-2 transition shadow-lg shadow-sky-900/30 disabled:opacity-50 shrink-0 self-start sm:self-center"
        >
          <Navigation className={`w-3.5 h-3.5 ${geoState.loading ? 'animate-spin' : ''}`} />
          <span>{geoState.loading ? 'Accessing GPS...' : 'Find Stations Near Me (GPS)'}</span>
        </button>
      </div>

      {geoState.error && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          {geoState.error}
        </div>
      )}

      {/* Emergency Help Section (Top Priority 24/7) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Emergency Financial Cyber Fraud Response Desk
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold animate-pulse">
            24/7 ROUND THE CLOCK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 1930 Card */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-rose-500/30 space-y-2">
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
              National Cyber Crime Helpline
            </span>
            <div className="flex items-center justify-between">
              <a href="tel:1930" className="text-2xl font-mono font-extrabold text-white hover:text-rose-400 transition">
                1930
              </a>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">Toll Free</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              <strong className="text-rose-300">Golden Hour Freeze: </strong>
              Call within 2 hours of unauthorized debit to hold stolen funds in recipient accounts via CFCFRMS.
            </p>
          </div>

          {/* 112 Emergency Police Card */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              All-India Police Emergency
            </span>
            <div className="flex items-center justify-between">
              <a href="tel:112" className="text-2xl font-mono font-extrabold text-white hover:text-sky-400 transition">
                112
              </a>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">National Emergency</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Direct police control room dispatch across all states and Union Territories in India.
            </p>
          </div>

          {/* Portal Link */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Official Reporting Portal
            </span>
            <div className="text-base font-bold text-sky-400 truncate pt-1">
              cybercrime.gov.in
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              File official cyber financial fraud complaints online and receive an acknowledgment tracking number.
            </p>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 underline font-medium pt-1"
            >
              Open Ministry of Home Affairs Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* City Cyber Police Stations Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: City Station Selector */}
        <div className="lg:col-span-4 space-y-2 max-h-[580px] overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Major City Cyber Cells:
          </span>

          {cityKeys.map((key) => {
            const station = cityStations[key];
            const isSelected = selectedCityKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCityKey(key)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-rose-500/60 bg-rose-500/10 text-white shadow-md shadow-rose-900/20'
                    : 'border-slate-800 bg-[#0b1222] text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="truncate">
                  <div className="font-semibold text-xs leading-snug">{station.city}</div>
                  <div className="text-[10px] text-slate-400 truncate">{station.state}</div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                  24/7 Desk
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Station Details Card */}
        {selectedStation && (
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedStation.station_name}</h3>
                </div>
                <p className="text-xs text-rose-400 font-medium mt-0.5">
                  {selectedStation.city}, {selectedStation.state} &bull; {selectedStation.jurisdiction || 'Metropolitan Cyber Division'}
                </p>
              </div>

              <a
                href={selectedStation.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStation.station_name + ' ' + selectedStation.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-md shadow-sky-900/20 self-start sm:self-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>

            {/* Station Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-sky-400" />
                  Station Emergency Desk Phone
                </span>
                <div className="font-mono font-bold text-white text-sm">
                  <a href={`tel:${selectedStation.phone}`} className="hover:text-sky-400 transition">
                    {selectedStation.phone}
                  </a>
                </div>
                {selectedStation.alternate_phone && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Alt: {selectedStation.alternate_phone}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Operational Timing
                </span>
                <div className="font-semibold text-emerald-400">
                  {selectedStation.timing || '24/7 Round the Clock Operational'}
                </div>
                <p className="text-[11px] text-slate-400">
                  In-Charge: {selectedStation.in_charge || 'DCP / ACP Cyber Crime'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Physical Address & Landmark
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {selectedStation.address}
                </p>
                {selectedStation.landmark && (
                  <p className="text-[11px] text-slate-400">
                    Landmark: <span className="text-slate-300">{selectedStation.landmark}</span>
                  </p>
                )}
              </div>

              {selectedStation.email && (
                <div className="p-3 rounded-xl bg-[#0b1222] border border-slate-800 space-y-1 sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-400">Official Cyber Cell Email:</span>
                    <a href={`mailto:${selectedStation.email}`} className="text-sky-400 font-mono hover:underline">
                      {selectedStation.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Instructions: How to File a Police Complaint */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileText className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            How to File a Cyber Crime Complaint at a Police Station (Standard Operating Procedure)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <h4 className="font-semibold text-white">Dial 1930 Immediately</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Call within 2-4 hours of fraud. Report transaction amount, UTR number, bank name, and suspect phone number to trigger an immediate bank freeze.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <h4 className="font-semibold text-white">Log on cybercrime.gov.in</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Register the financial fraud incident on the national portal. Upload screenshots and obtain your formal Complaint Acknowledgment Number.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <h4 className="font-semibold text-white">Prepare Evidence Dossier</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Print bank statement with disputed debits, screenshot of SMS/WhatsApp with sender header visible, and copy of formal dispute filed with your bank.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono">
              4
            </div>
            <h4 className="font-semibold text-white">Register Zero FIR</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Visit your nearest Cyber Cell or local police station. Under Section 154 CrPC, police cannot refuse a Zero FIR based on territorial jurisdiction.
            </p>
          </div>
        </div>

        {/* Evidence Checklist Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Documents Mandatory for Police FIR Filing: </span>
            <span className="text-slate-300">
              (1) Bank account statement showing debit, (2) UTR/Txn ID, (3) Screenshot of SMS showing sender ID (e.g. AD-SBIINB or mobile number), (4) Copy of Aadhaar/PAN, (5) Written application to Station House Officer (SHO).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
