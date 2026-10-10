const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send message and optional sender identifier to BankShield AI backend for fraud analysis.
 * @param {string} message - Raw SMS or WhatsApp text
 * @param {string} [sender] - Optional sender ID, header, or phone number
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeMessage(message, sender = null) {
  if (!message || !message.trim()) {
    throw new Error('Please enter or paste a message to analyze.');
  }

  const payload = {
    message: message.trim()
  };

  if (sender && sender.trim()) {
    payload.sender = sender.trim();
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.detail || `Analysis failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Fetch verified Indian banks directory.
 */
export async function fetchBanks() {
  try {
    const response = await fetch(`${API_BASE_URL}/banks`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend /banks endpoint unreachable, using fallback dataset', err);
  }
  return FALLBACK_BANKS;
}

/**
 * Fetch cyber crime police directory and national helplines.
 */
export async function fetchPoliceStations() {
  try {
    const response = await fetch(`${API_BASE_URL}/police-stations`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend /police-stations endpoint unreachable, using fallback dataset', err);
  }
  return FALLBACK_POLICE;
}

/**
 * Fetch categorized sample messages (genuine, scam, ambiguous).
 */
export async function fetchSampleMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/sample-messages`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend /sample-messages endpoint unreachable', err);
  }
  return [];
}

const FALLBACK_BANKS = [
  {
    id: "union_bank",
    name: "Union Bank of India",
    short_name: "Union Bank",
    code: "UBI",
    category: "Public Sector Bank",
    toll_free: "1800 22 2244",
    alternate_care: "1800 208 2244",
    fraud_helpline: "1800 22 2244 (Press 1 for immediate card/UPI blocking)",
    sms_block_code: "SMS 'UBLOCK <Account Number>' to 9223008486",
    official_website: "https://www.unionbankofindia.co.in",
    netbanking_url: "https://www.unionbankonline.co.in",
    dlt_senders: ["AD-UBINBK", "VM-UNIONB", "VK-UBININ"],
    official_app: "Union Vyom App",
    color: "#d9251c",
    maps_branch_query: "Union Bank of India branch near me",
    maps_atm_query: "Union Bank of India ATM near me"
  },
  {
    id: "sbi",
    name: "State Bank of India",
    short_name: "SBI",
    code: "SBI",
    category: "Public Sector Bank",
    toll_free: "1800 1234",
    alternate_care: "1800 2100",
    fraud_helpline: "1800 11 1109 / 094491 12211",
    sms_block_code: "SMS 'BLOCK <last 4 digits>' to 567676",
    official_website: "https://www.sbi.co.in",
    netbanking_url: "https://www.onlinesbi.sbi",
    dlt_senders: ["AD-SBIINB", "SBIPSG", "SBISMS", "VK-SBIINB"],
    official_app: "YONO SBI",
    color: "#280071",
    maps_branch_query: "State Bank of India branch near me",
    maps_atm_query: "State Bank of India ATM near me"
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    short_name: "HDFC Bank",
    code: "HDFC",
    category: "Private Sector Bank",
    toll_free: "1800 1600",
    alternate_care: "1800 266 4332",
    fraud_helpline: "1800 258 3838",
    sms_block_code: "SMS 'BLOCK <last 4 digits>' to 5676712",
    official_website: "https://www.hdfcbank.com",
    netbanking_url: "https://netbanking.hdfcbank.com",
    dlt_senders: ["VK-HDFCBK", "AD-HDFCBK", "VM-HDFCBK"],
    official_app: "HDFC Bank MobileBanking",
    color: "#004c8f",
    maps_branch_query: "HDFC Bank branch near me",
    maps_atm_query: "HDFC Bank ATM near me"
  },
  {
    id: "icici",
    name: "ICICI Bank",
    short_name: "ICICI Bank",
    code: "ICICI",
    category: "Private Sector Bank",
    toll_free: "1800 1080",
    alternate_care: "1800 103 8181",
    fraud_helpline: "1800 200 3344",
    sms_block_code: "SMS 'BLOCK <last 4 digits>' to 9215676766",
    official_website: "https://www.icicibank.com",
    netbanking_url: "https://infinity.icicibank.com",
    dlt_senders: ["VM-ICICIB", "VK-ICICIB", "AD-ICICIB"],
    official_app: "iMobile Pay",
    color: "#b02a30",
    maps_branch_query: "ICICI Bank branch near me",
    maps_atm_query: "ICICI Bank ATM near me"
  }
];

const FALLBACK_POLICE = {
  national_helplines: {
    cyber_fraud_helpline: "1930",
    emergency_police: "112",
    police_control_room: "100",
    portal_url: "https://cybercrime.gov.in",
    trai_spam_reporting: "1909"
  },
  city_stations: {
    mumbai: {
      city: "Mumbai",
      state: "Maharashtra",
      station_name: "BKC Cyber Crime Police Station (Mumbai Cyber Cell HQ)",
      phone: "022-26504008",
      alternate_phone: "022-26524008",
      control_room: "022-22621855",
      address: "Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051",
      timing: "24/7 Round the Clock Emergency Counter",
      email: "cybercell.mumbai@mahapolice.gov.in",
      maps_url: "https://www.google.com/maps/search/?api=1&query=BKC+Cyber+Crime+Police+Station+Mumbai"
    },
    delhi: {
      city: "Delhi",
      state: "Delhi NCR",
      station_name: "IFSO Special Cell / Cyber Police HQ Dwarka",
      phone: "011-20892633",
      control_room: "112",
      address: "Sector 17, Dwarka, New Delhi, Delhi 110078",
      timing: "24/7 Cyber Emergency Response Desk",
      email: "cybercell-delhi@nic.in",
      maps_url: "https://www.google.com/maps/search/?api=1&query=IFSO+Special+Cell+Dwarka+Delhi"
    },
    bengaluru: {
      city: "Bengaluru",
      state: "Karnataka",
      station_name: "CID Cyber Crime Police Station (Karnataka Police HQ)",
      phone: "080-22201021",
      control_room: "080-22942222",
      address: "Carlton House, Palace Road, Ambedkar Veedhi, Bengaluru, Karnataka 560001",
      timing: "24/7 Financial Cyber Fraud Investigation Desk",
      email: "cybercrimeps-cid@ksp.gov.in",
      maps_url: "https://www.google.com/maps/search/?api=1&query=CID+Cyber+Crime+Police+Station+Carlton+House+Bengaluru"
    },
    hyderabad: {
      city: "Hyderabad",
      state: "Telangana",
      station_name: "Cyberabad Cyber Crime Police Station",
      phone: "040-27852408",
      control_room: "040-27852435",
      address: "Cyberabad Police Commissionerate, Gachibowli, Hyderabad, Telangana 500032",
      timing: "24/7 Round the Clock Cyber Cell",
      email: "cybercrime-cyberabad@tspolice.gov.in",
      maps_url: "https://www.google.com/maps/search/?api=1&query=Cyberabad+Cyber+Crime+Police+Station+Gachibowli"
    }
  }
};
