import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Languages, 
  Sparkles, 
  Mic, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', label: 'English' },
  { code: 'hi-IN', name: 'Hindi', label: 'हिन्दी' },
  { code: 'te-IN', name: 'Telugu', label: 'తెలుగు' },
  { code: 'ta-IN', name: 'Tamil', label: 'தமிழ்' },
  { code: 'kn-IN', name: 'Kannada', label: 'ಕನ್ನಡ' },
  { code: 'ml-IN', name: 'Malayalam', label: 'മലയാളം' },
  { code: 'bn-IN', name: 'Bengali', label: 'বাংলা' },
  { code: 'mr-IN', name: 'Marathi', label: 'मराठी' },
  { code: 'gu-IN', name: 'Gujarati', label: 'ગુજરાતી' },
  { code: 'pa-IN', name: 'Punjabi', label: 'ਪੰਜਾਬੀ' }
];

// Multilingual safety voice scripts based on verdict
const VOICE_TRANSLATIONS = {
  'Dangerous': {
    'en-IN': 'High Risk Warning! BankShield AI has flagged this message as a Dangerous Scam. Do not click links or share any OTP or passwords. Immediately report fraud to helpline 1930.',
    'hi-IN': 'सावधान! बैंकशील्ड एआई ने इस संदेश को खतरनाक धोखाधड़ी बताया है। किसी भी लिंक पर क्लिक न करें और ओटीपी या पासवर्ड साझा न करें। तुरंत राष्ट्रीय हेल्पलाइन 1930 पर कॉल करें।',
    'te-IN': 'హై రిస్క్ హెచ్చరిక! బ్యాంక్‌షీల్డ్ AI ఈ సందేశాన్ని ప్రమాదకరమైన మోసంగా గుర్తించింది. లింక్‌లను క్లిక్ చేయవద్దు మరియు OTP లేదా పాస్‌వర్డ్‌లను షేర్ చేయవద్దు. వెంటనే సైబర్ హెల్ప్‌లైన్ 1930 కి కాల్ చేయండి.',
    'ta-IN': 'அபாயகரமான எச்சரிக்கை! இந்த செய்தி ஆபத்தான மோசடி என கண்டறியப்பட்டுள்ளது. இணைப்புகளை கிளிக் செய்யாதீர்கள், OTP அல்லது கடவுச்சொற்களை பகிராதீர்கள். உடனடியாக 1930 எண்ணை அழைக்கவும்.',
    'kn-IN': 'ಎಚ್ಚರಿಕೆ! ಈ ಸಂದೇಶವನ್ನು ಬ್ಯಾಂಕ್‌ಶೀಲ್ಡ್ AI ಅಪಾಯಕಾರಿ ವಂಚನೆ ಎಂದು ಗುರುತಿಸಿದೆ. ಯಾವುದೇ ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ ಮತ್ತು OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ತಕ್ಷಣವೇ 1930 ಗೆ ಕರೆ ಮಾಡಿ.',
    'ml-IN': 'ജാഗ്രത! ഈ സന്ദേശം അപകടകരമായ തട്ടിപ്പാണെന്ന് കണ്ടെത്തി. ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്, OTP പങ്കിടരുത്. ഉടൻ തന്നെ 1930 നമ്പറിലേക്ക് വിളിക്കുക.',
    'bn-IN': 'বিপদ সংকেত! এই বার্তাটি একটি বিপজ্জনক প্রতারণা। কোনো লিঙ্কে ক্লিক করবেন না এবং ওটিপি বা পাসওয়ার্ড শেয়ার করবেন না। অবিলম্বে ১৯৩০ নম্বরে কল করুন।',
    'mr-IN': 'धोकादायक इशारा! हा संदेश फसवणूक असल्याचे आढळले आहे. कोणत्याही लिंकवर क्लिक करू नका आणि ओटीपी शेअर करू नका. लगेच राष्ट्रीय हेल्पलाइन १९३० वर संपर्क साधा.',
    'gu-IN': 'ચેતવણી! આ મેસેજ ખતરનાક ફ્રોડ છે. કોઈપણ લિંક પર ક્લિક કરશો નહીં અને OTP શેર કરશો નહીં. તાત્કાલિક સાયબર હેલ્પલાઇન 1930 પર કૉલ કરો.',
    'pa-IN': 'ਸਾਵਧਾਨ! ਇਹ ਸੰਦੇਸ਼ ਖ਼ਤਰਨਾਕ ਧੋਖਾਧੜੀ ਹੈ। ਕਿਸੇ ਵੀ ਲਿੰਕ ਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ ਅਤੇ ਓਟੀਪੀ ਸਾਂਝਾ ਨਾ ਕਰੋ। ਤੁਰੰਤ 1930 ਤੇ ਕਾਲ ਕਰੋ।'
  },
  'Suspicious': {
    'en-IN': 'Caution Required. BankShield AI detected suspicious indicators. Verify the sender independently before clicking links or replying.',
    'hi-IN': 'सतर्कता आवश्यक है। इस संदेश में संदिग्ध संकेत पाए गए हैं। कोई भी कदम उठाने से पहले अपने बैंक के आधिकारिक ऐप पर जांच करें।',
    'te-IN': 'జాగ్రత్త అవసరం. ఈ సందేశంలో అనుమానాస్పద సంకేతాలు ఉన్నాయి. మీ బ్యాంక్ అధికారిక యాప్ ద్వారా మాత్రమే తనిఖీ చేయండి.',
    'ta-IN': 'எச்சரிக்கை தேவை. இந்த செய்தியில் சந்தேகத்திற்கிடமான அம்சங்கள் உள்ளன. வங்கியின் அதிகாரப்பூர்வ செயலி மூலம் சரிபார்க்கவும்.',
    'kn-IN': 'ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ. ಈ ಸಂದೇಶದಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಅಂಶಗಳಿವೆ. ಬ್ಯಾಂಕಿನ ಅಧಿಕೃತ ಆ್ಯಪ್ ಮೂಲಕ ಮಾತ್ರ ಪರಿಶೀಲಿಸಿ.',
    'ml-IN': 'ജാഗ്രത പാലിക്കുക. സംശയാസ്പദമായ സന്ദേശം. ബാങ്കിന്റെ ഔദ്യോഗിക ആപ്പ് വഴി സ്ഥിരീകരിക്കുക.',
    'bn-IN': 'সতর্কতা প্রয়োজন। এই বার্তায় সন্দেহজনক সংকেত পাওয়া গেছে। আপনার ব্যাংকের অফিসিয়াল অ্যাপের মাধ্যমে যাচাই করুন।',
    'mr-IN': 'काळजी घ्या. या संदेशात संशयास्पद बाबी आढळल्या आहेत. बँकेच्या अधिकृत अ‍ॅपद्वारे खात्री करा.',
    'gu-IN': 'સાવધાની જરૂરી છે. આ મેસેજમાં શંકાસ્પદ લક્ષણો મળ્યા છે. બેંકની અધિકૃત એપ દ્વારા ચકાસણી કરો.',
    'pa-IN': 'ਸਾਵਧਾਨੀ ਜ਼ਰੂਰੀ ਹੈ। ਇਸ ਸੰਦੇਸ਼ ਵਿੱਚ ਸ਼ੱਕੀ ਸੰਕੇਤ ਮਿਲੇ ਹਨ। ਆਪਣੇ ਬੈਂਕ ਦੇ ਅਧਿਕਾਰਤ ਐਪ ਰਾਹੀਂ ਜਾਂਚ ਕਰੋ।'
  },
  'CANNOT VERIFY': {
    'en-IN': 'Cannot Verify. Evidence is insufficient. The message lacks verifiable banking markers. Do not share sensitive personal information.',
    'hi-IN': 'सत्यापित नहीं किया जा सकता। साक्ष्य अपर्याप्त हैं। संदेश में आधिकारिक बैंक पहचान नहीं है। कृपया कोई व्यक्तिगत जानकारी साझा न करें।',
    'te-IN': 'ధృవీకరించడం సాధ్యం కాలేదు. తగిన ఆధారాలు లేవు. ఈ సందేశంలో బ్యాంక్ అధికారిక వివరాలు లేవు. వ్యక్తిగత సమాచారాన్ని షేర్ చేయవద్దు.',
    'ta-IN': 'சரிபார்க்க முடியவில்லை. போதிய ஆதாரங்கள் இல்லை. வங்கி விவரங்கள் தெளிவாக இல்லை. தனிப்பட்ட தகவல்களை பகிர வேண்டாம்.',
    'kn-IN': 'ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಪುರಾವೆಗಳು ಅಪೂರ್ಣವಾಗಿವೆ. ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ವಿವರಗಳಿಲ್ಲ. ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.',
    'ml-IN': 'സ്ഥിരീകരിക്കാൻ കഴിയില്ല. ആവശ്യമായ തെളിവുകളില്ല. സ്വകാര്യ വിവരങ്ങൾ പങ്കിടരുത്.',
    'bn-IN': 'যাচাই করা সম্ভব নয়। প্রমাণের অভাব রয়েছে। ব্যক্তিগত তথ্য শেয়ার করবেন না।',
    'mr-IN': 'सत्यापित करणे शक्य नाही. पुरावा अपुरा आहे. कोणतीही गोपनीय माहिती शेअर करू नका.',
    'gu-IN': 'ચકાસણી શક્ય નથી. પૂરતા પુરાવા નથી. બેંકની વિગતો અસ્પષ્ટ છે. સંવેદનશીલ વિગતો શેર ન કરો.',
    'pa-IN': 'ਪੁਸ਼ਟੀ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ਸਬੂਤ ਨਾਕਾਫੀ ਹਨ। ਕੋਈ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਨਾ ਕਰੋ।'
  },
  'Likely Safe': {
    'en-IN': 'Likely Safe. This communication matches legitimate bank transaction patterns. Always keep your banking passwords and OTP confidential.',
    'hi-IN': 'सुरक्षित प्रतीत होता है। यह संदेश वैध बैंक सूचना से मेल खाता है। अपने पासवर्ड और ओटीपी को हमेशा सुरक्षित रखें।',
    'te-IN': 'సురక్షితంగా ఉన్నట్లు కనిపిస్తోంది. ఈ సందేశం నిజమైన బ్యాంక్ లావాదేవీలకు అనుగుణంగా ఉంది. మీ పాస్‌వర్డ్‌లను ఎల్లప్పుడూ భద్రంగా ఉంచండి.',
    'ta-IN': 'பாதுகாப்பானது போல் தெரிகிறது. இது உண்மையான வங்கி பரிவர்த்தனை செய்தியுடன் பொருந்துகிறது.',
    'kn-IN': 'ಸುರಕ್ಷಿತವೆಂದು ತೋರುತ್ತದೆ. ಈ ಸಂವಹನವು ಅಧಿಕೃತ ಬ್ಯಾಂಕಿಂಗ್ ಮಾದರಿಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
    'ml-IN': 'സുരക്ഷിതമായി കാണപ്പെടുന്നു. ഇത് യഥാർത്ഥ ബാങ്കിംഗ് സന്ദേശവുമായി പൊരുത്തപ്പെടുന്നു.',
    'bn-IN': 'নিরাপদ বলে মনে হচ্ছে। এটি বৈধ ব্যাংক বিজ্ঞপ্তির সাথে মিলে যাচ্ছে।',
    'mr-IN': 'सुरक्षित दिसते. हा संदेश अधिकृत बँक व्यवहारांशी सुसंगत आहे.',
    'gu-IN': 'સુરક્ષિત જણાય છે. આ મેસેજ અસલી બેંકિંગ નોટિફિકેશન જેવો છે.',
    'pa-IN': 'ਸੁਰੱਖਿਅਤ ਜਾਪਦਾ ਹੈ। ਇਹ ਸੰਦੇਸ਼ ਅਸਲੀ ਬੈਂਕ ਲੈਣ-ਦੇਣ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਹੈ।'
  }
};

export default function VoiceAssistant({ analysisResult }) {
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  if (!analysisResult) return null;

  const verdict = analysisResult.verdict || 'Likely Safe';

  const handleSpeak = () => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop any currently playing audio

    const langGroup = VOICE_TRANSLATIONS[verdict] || VOICE_TRANSLATIONS['Likely Safe'];
    const textToSpeak = langGroup[selectedLang] || langGroup['en-IN'];

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectedLang;
    utterance.rate = speechSpeed;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-sky-500/30 bg-gradient-to-r from-sky-950/20 via-slate-900 to-indigo-950/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Info & Lang Select */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isPlaying 
            ? 'bg-sky-500 text-white animate-pulse shadow-sky-500/30' 
            : 'bg-slate-800 text-sky-400 border border-slate-700'
        }`}>
          <Volume2 className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Multilingual Voice Safety Readout
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-[10px] text-sky-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Playing Voice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                if (isPlaying) handleStop();
              }}
              className="bg-[#070c18] border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: Controls & Play Button */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {isPlaying ? (
          <button
            type="button"
            onClick={handleStop}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-rose-900/30"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Audio</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSpeak}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-sky-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Listen Safety Instructions</span>
          </button>
        )}
      </div>
    </div>
  );
}
