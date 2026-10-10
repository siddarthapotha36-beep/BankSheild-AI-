import React from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  Compass,
  ArrowRight,
  Clock,
  Smartphone
} from 'lucide-react';

export default function SenderLocationCard({ senderDetails, locationDetails }) {
  if (!senderDetails && !locationDetails) return null;

  const isAuthentic = senderDetails?.is_authentic_header;
  const isPersonalMobile = senderDetails?.sender_type?.includes('Personal');
  const hasDiscrepancy = locationDetails?.discrepancy_detected;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          Sender & Receiver Telecom Routing Telemetry
        </h4>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
          isAuthentic
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            : isPersonalMobile
            ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
            : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        }`}>
          {isAuthentic ? (
            <>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified Telecom DLT
            </>
          ) : isPersonalMobile ? (
            <>
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              Spoofed Personal Mobile
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Unverified Sender
            </>
          )}
        </span>
      </div>

      {/* Grid: Sender & Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Left: Sender Origin Details */}
        <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-sky-400" />
              Sender Origin
            </span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {senderDetails?.raw_sender || 'Not Specified'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Header Class:</span>
            <span className="text-slate-200 font-medium text-right truncate ml-2">
              {senderDetails?.sender_type || 'Direct Submission'}
            </span>
          </div>

          {senderDetails?.telecom_operator && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-sky-400" />
                Origin Carrier:
              </span>
              <span className="text-slate-200">{senderDetails.telecom_operator}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              Origin Telecom Circle:
            </span>
            <span className="text-slate-200 font-medium">{locationDetails?.telecom_circle || locationDetails?.origin_region || 'National Network'}</span>
          </div>

          {senderDetails?.flag && (
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
              {senderDetails.flag}
            </p>
          )}
        </div>

        {/* Right: Location Receiver & Handset Delivery */}
        <div className="p-3.5 rounded-xl bg-[#0b1222] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              Location Receiver
            </span>
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
              {locationDetails?.receiver_region || 'India (Domestic Handset)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              Termination Network:
            </span>
            <span className="text-slate-200">{locationDetails?.receiver_telecom || 'National Cellular Route'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Server className="w-3 h-3 text-purple-400" />
              Host Route / IP:
            </span>
            <span className="text-slate-200 font-mono text-[11px] truncate ml-2">
              {locationDetails?.ip_origin || 'Direct Cellular Gateway'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-400" />
              Cyber Helpline:
            </span>
            <span className="text-rose-400 font-mono font-bold">
              1930 (24x7 Round the Clock)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
            {isAuthentic
              ? 'Authorized scheduled banking route terminating on domestic subscriber terminal.'
              : 'Unverified delivery link. Financial transactions should only be authorized via official apps.'}
          </p>
        </div>
      </div>

      {/* Origin Discrepancy Alert */}
      {hasDiscrepancy && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Origin Geolocation Anomaly Detected: </span>
            <span>{locationDetails?.discrepancy_reason || 'Sender claims domestic banking communication but connects through untrusted external infrastructure.'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
