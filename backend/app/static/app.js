// ══════════════════════════════════════════════════════════════════════════
// CROPAI PROGRESSIVE WEB APPLICATION — MAIN LOGIC & CONTROLLER (V2)
// ══════════════════════════════════════════════════════════════════════════

// ── Slider configuration (8 parameters) ──────────────────────────────────
const SLIDER_CONFIG = [
  { id: "nitrogen",      label: "Nitrogen (N)",        unit: "kg/ha", min: 0,   max: 500, step: 1,   default: 45  },
  { id: "phosphorous",   label: "Phosphorous (P)",      unit: "kg/ha", min: 0,   max: 200, step: 1,   default: 25  },
  { id: "potassium",     label: "Potassium (K)",        unit: "kg/ha", min: 0,   max: 400, step: 1,   default: 35  },
  { id: "ph",            label: "Soil pH",              unit: "",      min: 3.5, max: 9.5, step: 0.1, default: 7.2 },
  { id: "moisture",      label: "Soil Moisture",        unit: "%",     min: 5,   max: 60,  step: 1,   default: 28  },
  { id: "rainfall_mm",   label: "Rainfall",             unit: "mm",    min: 0,   max: 2000,step: 5,   default: 850 },
  { id: "temperature_c", label: "Temperature",          unit: "°C",    min: 5,   max: 50,  step: 0.5, default: 28.5},
  { id: "humidity",      label: "Humidity",             unit: "%",     min: 10,  max: 100, step: 1,   default: 65  },
];

const sliderValues = {};
SLIDER_CONFIG.forEach(s => { sliderValues[s.id] = s.default; });

let areaHectares = 1.5; // Default 1.5 ha (3.71 acres)
let metadata = null;
let map = null;
let drawnItems = null;
let activeShape = null;
let anchorMarker = null;
let currentCommittedPlan = null;
let currentLanguage = localStorage.getItem("cropai_lang") || "en";
let currentAttachmentFile = null;

const mapState = {
  latitude: 20.5937,
  longitude: 78.9629,
  recentRainfall: 83.2,
  climateRainfall: 71.98,
};

// ── Point 4: English <-> Tamil Translation Dictionary ───────────────────────
const I18N = {
  en: {
    brand_subtitle: "Smart Farming Platform",
    main_navigation: "MAIN FEATURES",
    support_ai: "SUPPORT & AI",
    nav_home: "Crop Recommendation",
    nav_analytics: "Analytics",
    nav_schedule: "Schedule & Plan",
    nav_ai_chat: "Ask SmartFarm AI",
    nav_settings: "Settings",
    logout_btn: "Logout",
    home_heading: "Crop Recommendation",
    home_sub: "Get AI-powered crop recommendations based on your soil and environmental conditions",
    soil_card_title: "Soil & Environmental Data",
    soil_card_sub: "Enter your field's soil and environmental conditions to get AI-powered crop recommendations",
    soil_type_lbl: "SOIL TYPE",
    icar_calibrated: "Soil data calibrated from",
    prev_crop_lbl: "PREVIOUS CROP",
    irrigation_lbl: "IRRIGATION SOURCE",
    predict_btn: "Predict Best Crop",
    field_status_title: "Field Status Overview",
    field_status_sub: "Draw land boundary to calculate GPS coordinates, plot area, and live precipitation",
    my_location: "My Location",
    polygon_tool: "Polygon",
    rect_tool: "Rectangle",
    circle_tool: "Circle",
    clear_tool: "Clear",
    area_lbl: "Area",
    coords_lbl: "Coordinates",
    recent_rain_lbl: "Recent 30-Day Rain (Irrigation Suppression)",
    climate_rain_lbl: "Climate Model Rain (Feeds ML Engine)",
    map_hint: "Click map or draw boundary to calibrate location.",
    analytics_heading: "Prediction & Economic Analytics",
    analytics_sub: "Machine learning ranking, agronomic viability, and market profit analysis.",
    dl_report_btn: "Download Farm Report",
    commit_plan_btn: "Commit & Generate Sowing Schedule",
    stat_match: "Match Score",
    stat_yield: "Expected Yield",
    stat_profit: "Net Profit",
    stat_water: "Water Need",
    ml_metrics_title: "Historical & ML Model Metrics",
    ml_metrics_sub: "ML Stacking Ensemble Performance across 22 Indian Crops",
    why_this_crop: "🌱 Agronomic Fit & Why This Crop?",
    rejected_crops: "🚫 Rejected Crops (Season & Soil Mismatch)",
    crop_matrix_title: "22-Crop Agronomic Matrix",
    crop_matrix_sub: "Full ranking with sowing calendar and profit estimates",
    th_crop: "Crop", th_sow: "Sow", th_harvest: "Harvest", th_yield: "Yield (t/ha)", th_price: "Price (₹/kg)", th_profit: "Profit (₹/ha)", th_action: "Action",
    schedule_heading: "Sowing Schedule & Operations",
    schedule_sub: "ICAR/TNAU dated milestone checklist and multi-crop rotation plan.",
    weather_sync: "Weather Sync",
    sowing_date_lbl: "SOWING DATE",
    harvest_date_lbl: "EXPECTED HARVEST",
    budget_status_lbl: "Budget Status",
    adherence_lbl: "Task Adherence",
    risk_lbl: "Profit at Risk",
    wa_active_notice: "Automated WhatsApp & SMS alerts active for due tasks.",
    rotation_title: "1-Year Multi-Crop Rotation Plan",
    rotation_sub: "365-day sustainable cycle with mandatory 20-day soil restoration gaps",
    settings_heading: "Settings & Configuration",
    settings_sub: "Manage farmer notifications, language, profile details, and data preferences.",
    notif_title: "Alerts & Notifications",
    notif_sub: "Automated alerts via WhatsApp and SMS",
    wa_alerts_opt: "WhatsApp Farm Alerts",
    wa_alerts_desc: "Direct advisory messages for pending tasks and spray days",
    weather_warn_opt: "Weather Warnings",
    weather_warn_desc: "Rainfall and extreme heat recalibration notifications",
    lang_card_title: "Language & Region",
    lang_card_sub: "Select app interface language and voice assistant language",
    interface_lang_lbl: "INTERFACE LANGUAGE",
    profile_title: "Farmer Profile",
    profile_sub: "Manage your registered phone number and details",
    full_name_lbl: "FULL NAME",
    phone_lbl: "MOBILE NUMBER",
    email_lbl: "EMAIL ADDRESS",
    save_profile_btn: "Save Profile Changes",
    bot_greeting_title: "Hello! I'm your SmartFarm AI assistant 🌿",
    bot_greeting_body: "Ask me anything about crop recommendation, soil health, fertilizers, pest control, weather, or farming techniques. You can also upload photos of crop leaves for disease diagnosis!",
    sugg_crop: "Best crop for my soil?",
    sugg_fert: "Fertilizer for Blackgram?",
    sugg_pest: "Natural pest control?",
    sugg_water: "Water requirement?",
    auth_modal_title: "Farmer Sign In & Commit Plan",
    auth_modal_sub: "Enter your mobile number to receive task reminders on WhatsApp & SMS",
    otp_code_lbl: "VERIFICATION CODE (OTP)",
    send_otp_btn: "Send Verification Code",
    verify_login_btn: "Verify & Commit Plan",
    google_login_text: "Continue with Google",
  },
  ta: {
    brand_subtitle: "ஸ்மார்ட் விவசாய தளம்",
    main_navigation: "முக்கிய வசதிகள்",
    support_ai: "ஆலோசகர் & AI",
    nav_home: "பயிர் பரிந்துரை",
    nav_analytics: "பகுப்பாய்வு",
    nav_schedule: "திட்டம் & அட்டவணை",
    nav_ai_chat: "விவசாய AI ஆலோசகர்",
    nav_settings: "அமைப்புகள்",
    logout_btn: "வெளியேறு (Logout)",
    home_heading: "பயிர் பரிந்துரை",
    home_sub: "மண் மற்றும் வானிலை தகவல்களின் அடிப்படையில் மிகச்சிறந்த பயிரை கண்டறியுங்கள்",
    soil_card_title: "மண் & சுற்றுச்சூழல் விவரங்கள்",
    soil_card_sub: "உங்கள் நிலத்தின் மண் அளவுருக்களை உள்ளிட்டு செயற்கை நுண்ணறிவு பரிந்துரையைப் பெறுங்கள்",
    soil_type_lbl: "மண் வகை",
    icar_calibrated: "மண் தகவல்கள் தானாக நிரப்பப்பட்டது",
    prev_crop_lbl: "முந்தைய பயிர்",
    irrigation_lbl: "நீர்ப்பாசன ஆதாரம்",
    predict_btn: "சிறந்த பயிரைக் கணிக்கவும்",
    field_status_title: "நிலத்தின் செயற்கைக்கோள் வரைபடம்",
    field_status_sub: "நிலப்பரப்பை வரைந்து GPS அமைவிடம், பரப்பளவு மற்றும் மழை அளவை கணக்கிடுங்கள்",
    my_location: "என் இருப்பிடம்",
    polygon_tool: "பல்கோணம் (Polygon)",
    rect_tool: "செவ்வகம் (Rectangle)",
    circle_tool: "வட்டம் (Circle)",
    clear_tool: "அழி (Clear)",
    area_lbl: "பரப்பளவு",
    coords_lbl: "GPS அமைவிடம்",
    recent_rain_lbl: "சமீபத்திய 30 நாள் மழை",
    climate_rain_lbl: "பருவநிலை மாதிரி மழை",
    map_hint: "வரைபடத்தில் கிளிக் செய்து உங்கள் நிலத்தை தேர்ந்தெடுக்கவும்.",
    analytics_heading: "பயிர் பகுப்பாய்வு & பொருளாதார மதிப்பீடு",
    analytics_sub: "மெஷின் லேர்னிங் தரவரிசை, நிலப் பொருத்தம் மற்றும் இலாப பகுப்பாய்வு.",
    dl_report_btn: "விவசாய அறிக்கையைப் பதிவிறக்குக",
    commit_plan_btn: "விதைப்பு கால அட்டவணையை உருவாக்கவும்",
    stat_match: "பொருத்த விகிதம்",
    stat_yield: "எதிர்பார்க்கப்படும் மகசூல்",
    stat_profit: "நிகர இலாபம்",
    stat_water: "தண்ணீர் தேவை",
    ml_metrics_title: "வரலாற்று & AI மாதிரி மதிப்பீடு",
    ml_metrics_sub: "22 இந்திய பயிர்களுக்கான AI Stacking மாதிரி துல்லியம்",
    why_this_crop: "🌱 நிலப் பொருத்தம் & ஏன் இந்த பயிர்?",
    rejected_crops: "🚫 நிராகரிக்கப்பட்ட பயிர்கள் (பருவநிலை/மண் பொருந்தாமை)",
    crop_matrix_title: "22-பயிர் ஒப்பீட்டு அட்டவணை",
    crop_matrix_sub: "முழு பயிர் தரவரிசை, விதைப்பு காலம் மற்றும் இலாப மதிப்பீடு",
    th_crop: "பயிர்", th_sow: "விதைப்பு", th_harvest: "அறுவடை", th_yield: "மகசூல் (t/ha)", th_price: "விலை (₹/kg)", th_profit: "இலாபம் (₹/ha)", th_action: "நடவடிக்கை",
    schedule_heading: "விதைப்பு கால அட்டவணை",
    schedule_sub: "ICAR/TNAU வழிமுறைகளுடன் கூடிய நாள்காட்டி மற்றும் சுழற்சி முறை பயிர் திட்டம்.",
    weather_sync: "வானிலை ஒத்திசைவு",
    sowing_date_lbl: "விதைப்பு தேதி",
    harvest_date_lbl: "எதிர்பார்க்கப்படும் அறுவடை",
    budget_status_lbl: "செலவு நிலை",
    adherence_lbl: "பணி முன்னேற்றம்",
    risk_lbl: "இழப்பு அபாயம்",
    wa_active_notice: "வாட்ஸ்அப் & SMS மூலம் விழிப்புணர்வு எச்சரிக்கைகள் இயங்குகின்றன.",
    rotation_title: "1-வருட சுழற்சி முறை பயிர் திட்டம்",
    rotation_sub: "மண் வளம் காக்கும் 20 நாள் இடைவெளியுடன் கூடிய 365 நாள் பயிர் சுழற்சி முறை",
    settings_heading: "அமைப்புகள்",
    settings_sub: "விவசாயி விவரங்கள், மொழி, வாட்ஸ்அப் அறிவிப்புகள் மற்றும் தரவு அமைப்புகள்.",
    notif_title: "விழிப்புணர்வு அறிவிப்புகள்",
    notif_sub: "வாட்ஸ்அப் மற்றும் SMS வழியான தானியங்கி செய்திகள்",
    wa_alerts_opt: "வாட்ஸ்அப் விவசாய அறிவிப்புகள்",
    wa_alerts_desc: "உரமிடுதல், பூச்சி மேலாண்மை பணிகளுக்கான நேரடி வாட்ஸ்அப் செய்தி",
    weather_warn_opt: "வானிலை எச்சரிக்கைகள்",
    weather_warn_desc: "கனமழை மற்றும் வறட்சி முன்னறிவிப்பு எச்சரிக்கைகள்",
    lang_card_title: "மொழி மற்றும் பகுதி",
    lang_card_sub: "பயன்பாட்டு மொழி மற்றும் தமிழ் குரல் உதவியாளரைத் தேர்ந்தெடுக்கவும்",
    interface_lang_lbl: "பயன்பாட்டு மொழி",
    profile_title: "விவசாயி விவரங்கள்",
    profile_sub: "பதிவு செய்யப்பட்ட தொலைபேசி எண் மற்றும் சுயவிவர மேலாண்மை",
    full_name_lbl: "முழு பெயர்",
    phone_lbl: "கைபேசி எண்",
    email_lbl: "மின்னஞ்சல் முகவரி",
    save_profile_btn: "விவரங்களை சேமிக்கவும்",
    bot_greeting_title: "வணக்கம்! நான் உங்கள் ஸ்மார்ட்ஃபார்ம் AI ஆலோசகர் 🌿",
    bot_greeting_body: "பயிர் பரிந்துரை, மண் வளம், உரம், பூச்சி கட்டுப்பாடு, வானிலை அல்லது இயற்கை விவசாயம் பற்றி என்னிடம் கேளுங்கள். பயிர் இலைகளின் புகைப்படத்தை பதிவேற்றி நோய்களைக் கண்டறியலாம்!",
    sugg_crop: "என் மண்ணிற்கு ஏற்ற பயிர் எது?",
    sugg_fert: "உளுந்து பயிருக்கான உர அளவு என்ன?",
    sugg_pest: "இயற்கை பூச்சி மேலாண்மை முறைகள்?",
    sugg_water: "இந்த பருவத்திற்கு தண்ணீர் தேவை எவ்வளவு?",
    auth_modal_title: "விவசாயி உள்நுழைவு & திட்டம் உறுதிசெய்தல்",
    auth_modal_sub: "வாட்ஸ்அப் மற்றும் SMS-ல் அறிவிப்புகளைப் பெற கைபேசி எண்ணை உள்ளிடவும்",
    otp_code_lbl: "சரிபார்ப்பு குறியீடு (OTP)",
    send_otp_btn: "சரிபார்ப்புக் குறியீட்டை அனுப்புக",
    verify_login_btn: "சரிபார்த்து உள்நுழைக",
    google_login_text: "Google கணக்கு மூலம் தொடரவும்",
  }
};

window.setLanguage = function(lang) {
  currentLanguage = lang;
  localStorage.setItem("cropai_lang", lang);
  document.documentElement.lang = lang;

  const dict = I18N[lang] || I18N.en;

  // Update all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Toggle button texts
  const nextLangLabel = lang === "ta" ? "English" : "தமிழ்";
  const headerBtnText = document.getElementById("header-lang-text");
  if (headerBtnText) headerBtnText.textContent = nextLangLabel;
  const dLangLabel = document.getElementById("d-lang-label");
  if (dLangLabel) dLangLabel.textContent = nextLangLabel;
  const menuLangText = document.getElementById("menu-lang-text");
  if (menuLangText) menuLangText.textContent = lang === "ta" ? "English" : "தமிழ் (Tamil)";
  const setLangSelect = document.getElementById("set-language");
  if (setLangSelect) setLangSelect.value = lang;

  // Update assistant input placeholder
  const aInp = document.getElementById("assistant-input");
  if (aInp) {
    aInp.placeholder = lang === "ta"
      ? "பயிர்கள், உரம், பூச்சிகள் பற்றி கேளுங்கள்..."
      : "Ask about crops, fertilizers, pests...";
  }

  // Update greeting bubble time
  const gTime = document.getElementById("chat-greet-time");
  if (gTime) {
    gTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  console.log(`Language switched to: ${lang}`);
};

// ── Common English -> Tamil transliteration/dictionary for voice reading ──
const TA_VOICE_DICT = [
  // Symbols & units
  [/&amp;/gi, " மற்றும் "],
  [/&/gi, " மற்றும் "],
  [/%/gi, " சதவீதம் "],
  [/₹/gi, " ரூபாய் "],
  [/\//gi, " அல்லது "],
  [/\bha\b/gi, " ஹெக்டேர் "],
  [/\bkg\b/gi, " கிலோகிராம் "],
  [/\bmm\b/gi, " மில்லிமீட்டர் "],
  [/\bac\b/gi, " ஏக்கர் "],
  [/\bacres?\b/gi, " ஏக்கர் "],
  [/\bt\/ha\b/gi, " டன் ஒரு ஹெக்டேருக்கு "],
  
  // Crops
  [/\bblackgram\b/gi, " உளுந்து "],
  [/\brice\b/gi, " நெல் "],
  [/\bpaddy\b/gi, " நெல் "],
  [/\bcotton\b/gi, " பருத்தி "],
  [/\bmaize\b/gi, " சோளம் "],
  [/\bsugarcane\b/gi, " கரும்பு "],
  [/\bwheat\b/gi, " கோதுமை "],
  [/\bchickpea\b/gi, " கொண்டைக்கடலை "],
  [/\bgroundnut\b/gi, " நிலக்கடலை "],
  [/\bpigeonpea\b/gi, " துவரை "],
  [/\bbanana\b/gi, " வாழை "],
  [/\bcoconut\b/gi, " தென்னை "],
  [/\bpapaya\b/gi, " பப்பாளி "],
  [/\bcoffee\b/gi, " காப்பி "],
  [/\bjute\b/gi, " சணல் "],
  [/\blentil\b/gi, " பருப்பு "],
  [/\bmungbean\b/gi, " பாசிப்பயறு "],
  [/\bwatermelon\b/gi, " தர்பூசணி "],
  [/\bmuskmelon\b/gi, " முலாம்பழம் "],
  [/\bapple\b/gi, " ஆப்பிள் "],
  [/\borange\b/gi, " ஆரஞ்சு "],
  [/\bpomegranate\b/gi, " மாதுளை "],
  [/\bgrapes\b/gi, " திராட்சை "],
  [/\bmango\b/gi, " மாம்பழம் "],

  // Agronomic terms
  [/\bfertilizer\b/gi, " உரம் "],
  [/\burea\b/gi, " யூரியா "],
  [/\bdap\b/gi, " டிஏபி உரம் "],
  [/\bmop\b/gi, " பொட்டாஷ் உரம் "],
  [/\bnitrogen\b/gi, " தழைச்சத்து "],
  [/\bphosphorus\b/gi, " மணிச்சத்து "],
  [/\bpotassium\b/gi, " சாம்பல் சத்து "],
  [/\birrigation\b/gi, " பாசனம் "],
  [/\bwater\b/gi, " தண்ணீர் "],
  [/\bpest\b/gi, " பூச்சி "],
  [/\bdisease\b/gi, " நோய் "],
  [/\byield\b/gi, " மகசூல் "],
  [/\bprofit\b/gi, " இலாபம் "],
  [/\bsowing\b/gi, " விதைப்பு "],
  [/\bharvest\b/gi, " அறுவடை "],
  [/\bmonths?\b/gi, " மாதங்கள் "],
  [/\bdays?\b/gi, " நாட்கள் "],
  [/\bborewell\b/gi, " ஆழ்துளை கிணறு "],
  [/\bcanal\b/gi, " கால்வாய் "],
  [/\bdrip\b/gi, " சொட்டு நீர் "],
  [/\bsprinkler\b/gi, " தெளிப்பு நீர் "],
  [/\brain-?fed\b/gi, " மானாவாரி "],
  [/\bseed\b/gi, " விதை "],
  [/\bweed\b/gi, " களை "],
  [/\bspray\b/gi, " தெளித்தல் "]
];

// // ── Point 4: Slow, Clear Tamil Voice Synthesis (fully fixed) ────────────────
window.speakText = function(text) {
  if (!("speechSynthesis" in window) || !text) return;
  try {
    window.speechSynthesis.cancel();
    let cleanText = text.replace(/[*#_`]/g, "").slice(0, 500);

    if (currentLanguage === "ta") {
      // 1. Translate well-known English agricultural terms and crop names to Tamil
      for (const [pattern, replacement] of TA_VOICE_DICT) {
        cleanText = cleanText.replace(pattern, replacement);
      }

      // 2. Clean up punctuation and remaining stray English words
      cleanText = cleanText.replace(/[a-zA-Z]+/g, " ");
      cleanText = cleanText.replace(/\s+/g, " ").trim();
    }

    if (!cleanText) return;
    const utter = new SpeechSynthesisUtterance(cleanText);

    if (currentLanguage === "ta") {
      utter.lang = "ta-IN";
      utter.rate = 0.82;
      utter.pitch = 1.0;
      // Find Tamil voice — retry after voices load
      const trySetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const tamilVoice = voices.find(v =>
          v.lang === "ta-IN" || v.lang.startsWith("ta") ||
          v.name.toLowerCase().includes("tamil") || v.name.includes("தமிழ்")
        );
        if (tamilVoice) utter.voice = tamilVoice;
      };
      trySetVoice();
      if (!utter.voice) window.speechSynthesis.onvoiceschanged = trySetVoice;
    } else {
      utter.lang = "en-IN";
      utter.rate = 0.95;
    }

    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn("TTS Error:", err);
  }
};

// ── Point 2 & Point 8: Dedicated View Switcher ───────────────────────────────
window.currentView = "view-home";
window.previousView = "view-home";

window.switchView = function(viewId) {
  if (viewId !== "view-chat") {
    window.previousView = viewId;
  }
  window.currentView = viewId;

  // Toggle visibility of panels
  document.querySelectorAll(".pwa-view-panel").forEach(panel => {
    panel.classList.remove("active");
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
  }

  // Update mobile bottom nav items
  document.querySelectorAll(".bottom-nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  // Update desktop sidebar items
  document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  // Header Back Button & Floating AI Button handling
  const backBtn = document.getElementById("chat-back-btn");
  const floatBtn = document.getElementById("floating-chat-btn");
  const brandTitle = document.querySelector(".brand-title");

  if (viewId === "view-chat") {
    if (backBtn) backBtn.style.display = "flex";
    if (floatBtn) floatBtn.style.display = "none";
    if (brandTitle) brandTitle.textContent = currentLanguage === "ta" ? "விவசாய AI ஆலோசகர்" : "CropAI Assistant";
    // Scroll chat to latest message
    const cBox = document.getElementById("chat-messages");
    if (cBox) cBox.scrollTop = cBox.scrollHeight;
  } else {
    if (backBtn) backBtn.style.display = "none";
    if (floatBtn) floatBtn.style.display = "flex";
    if (brandTitle) brandTitle.textContent = "CropAI";
  }

  // Re-adjust Leaflet map size on Home view
  if (viewId === "view-home" && map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ── Point 1: Map Initialization with Strict Containment ─────────────────────
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = L.map("map", {
    zoomControl: false, // We will re-add it inside the container
    attributionControl: false // Custom position inside container
  }).setView([mapState.latitude, mapState.longitude], 5);

  // Add zoom controls strictly at top-left
  L.control.zoom({ position: "topleft" }).addTo(map);

  // Add attribution strictly at bottom-right
  L.control.attribution({ position: "bottomright", prefix: false })
    .addAttribution('Leaflet | Powered by Esri')
    .addTo(map);

  // High-resolution Esri World Imagery (Satellite)
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18, attribution: "Esri" }
  ).addTo(map);

  // OpenStreetMap administrative labels overlay
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { opacity: 0.28, maxZoom: 18 }
  ).addTo(map);

  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Map Click Handler
  map.on("click", async e => {
    const lat = Number(e.latlng.lat.toFixed(5));
    const lng = Number(e.latlng.lng.toFixed(5));
    updateMapLocation(lat, lng);
  });

  // Map Draw Created Handler
  map.on(L.Draw.Event.CREATED, event => {
    drawnItems.clearLayers();
    activeShape = event.layer;
    drawnItems.addLayer(activeShape);

    let calculatedAreaHa = 1.5;
    if (event.layerType === "circle") {
      const r = activeShape.getRadius();
      calculatedAreaHa = (Math.PI * r * r) / 10000;
    } else {
      const latlngs = activeShape.getLatLngs()[0] || activeShape.getLatLngs();
      if (latlngs && latlngs.length >= 3) {
        calculatedAreaHa = L.GeometryUtil ? (L.GeometryUtil.geodesicArea(latlngs) / 10000) : 1.5;
      }
    }
    areaHectares = Math.max(0.1, Number(calculatedAreaHa.toFixed(3)));
    const acres = (areaHectares * 2.471).toFixed(2);
    document.getElementById("area-display").textContent = `${areaHectares.toFixed(3)} ha (${acres} ac)`;

    const center = activeShape.getBounds().getCenter();
    updateMapLocation(Number(center.lat.toFixed(5)), Number(center.lng.toFixed(5)));
  });
}

async function updateMapLocation(lat, lng) {
  mapState.latitude = lat;
  mapState.longitude = lng;
  document.getElementById("coords-display").textContent = `${lat}, ${lng}`;

  if (anchorMarker) map.removeLayer(anchorMarker);
  anchorMarker = L.marker([lat, lng]).addTo(map);

  setStatus(`Location updated: ${lat}, ${lng}. Syncing climate data...`);

  // Fetch weather and precipitation
  try {
    const w = await fetchLiveWeather(lat, lng);
    if (w.temperature) setSliderValue("temperature_c", w.temperature);
    if (w.humidity) setSliderValue("humidity", w.humidity);
    if (w.soilMoisture) setSliderValue("moisture", Math.round(w.soilMoisture * 100));

    const r = await fetchRainfallHistory(lat, lng);
    mapState.recentRainfall = Number(r.recent30Total.toFixed(1));
    mapState.climateRainfall = Number(r.climateMonthlyEquivalent.toFixed(1));

    document.getElementById("recent-rainfall-display").textContent = `${mapState.recentRainfall} mm`;
    document.getElementById("climate-rainfall-display").textContent = `${mapState.climateRainfall} mm`;
    setSliderValue("rainfall_mm", Math.round(r.annualTotal / 12));
    setStatus(`✓ Synced live climate & precipitation for ${lat}, ${lng}`);
  } catch (err) {
    console.warn("Weather sync notice:", err);
  }
}

async function fetchLiveWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,soil_moisture_0_to_1cm&timezone=auto`;
  const res = await fetch(url).then(r => r.json());
  const cur = res.current || {};
  return {
    temperature: cur.temperature_2m,
    humidity: cur.relative_humidity_2m,
    soilMoisture: cur.soil_moisture_0_to_1cm,
  };
}

async function fetchRainfallHistory(lat, lng) {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 364 * 86400000).toISOString().slice(0, 10);
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&daily=precipitation_sum&timezone=auto`;
  const res = await fetch(url).then(r => r.json());
  const arr = Array.isArray(res.daily?.precipitation_sum) ? res.daily.precipitation_sum.map(Number) : [];
  const sum = arr.filter(v => Number.isFinite(v) && v > 0).reduce((a, b) => a + b, 0);
  const recent30 = arr.slice(-30).filter(v => Number.isFinite(v) && v > 0).reduce((a, b) => a + b, 0);
  return {
    annualTotal: sum || 850,
    recent30Total: recent30 || 83.2,
    climateMonthlyEquivalent: (sum / 12) || 71.98,
  };
}

// ── Slider Management ───────────────────────────────────────────────────────
function renderSliders() {
  const grid = document.getElementById("slider-grid");
  if (!grid) return;
  grid.innerHTML = "";

  SLIDER_CONFIG.forEach(cfg => {
    const val = sliderValues[cfg.id] !== undefined ? sliderValues[cfg.id] : cfg.default;
    const card = document.createElement("div");
    card.className = "param-card";
    card.innerHTML = `
      <div class="param-header">
        <span class="param-name">${cfg.label.toUpperCase()}</span>
        <div>
          <strong class="param-val" id="val-${cfg.id}">${val}</strong>
          <span class="param-unit">${cfg.unit}</span>
        </div>
      </div>
      <input type="range" class="param-slider" id="slider-${cfg.id}"
             min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${val}" />
    `;
    grid.appendChild(card);

    const slider = card.querySelector("input");
    slider.addEventListener("input", e => {
      setSliderValue(cfg.id, e.target.value);
    });
  });
}

function setSliderValue(id, val) {
  const num = Number(val);
  sliderValues[id] = num;
  const disp = document.getElementById(`val-${id}`);
  if (disp) disp.textContent = num;
  const slider = document.getElementById(`slider-${id}`);
  if (slider && slider.value != num) slider.value = num;
}

// Soil Type presets
const SOIL_PRESETS = {
  alluvial:     { nitrogen: 68, phosphorous: 48, potassium: 55, ph: 7.0, moisture: 30 },
  black_cotton: { nitrogen: 55, phosphorous: 35, potassium: 70, ph: 7.8, moisture: 35 },
  red_laterite: { nitrogen: 40, phosphorous: 25, potassium: 30, ph: 5.8, moisture: 22 },
  sandy_loam:   { nitrogen: 45, phosphorous: 30, potassium: 35, ph: 6.5, moisture: 18 },
  clay:         { nitrogen: 75, phosphorous: 55, potassium: 80, ph: 6.8, moisture: 40 },
};

// ── Point 7: Prediction with Previous Crop & Irrigation Source ───────────────
function collectPayload() {
  const payload = {
    top_k: 5,
    area: areaHectares || 1.5,
    latitude: mapState.latitude,
    longitude: mapState.longitude,
  };
  SLIDER_CONFIG.forEach(cfg => {
    payload[cfg.id] = sliderValues[cfg.id];
  });

  const prevCrop = document.getElementById("previous-crop-select")?.value;
  const irrigation = document.getElementById("irrigation-select")?.value;
  const soilType = document.getElementById("soil-type-select")?.value;

  if (prevCrop) payload.previous_crop = prevCrop;
  if (irrigation) payload.irrigation_source = irrigation;
  if (soilType) payload.soil_type = soilType;

  return payload;
}

async function runPredict() {
  try {
    setStatus("Analyzing soil, satellite precipitation, and running ML prediction...");
    const payload = collectPayload();

    const resp = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.detail || "Prediction failed");
    }

    const data = await resp.json();
    renderResults(data);
    setStatus(`✔ AI Recommendation ready: ${data.best_crop}`);

    // Auto-navigate to Analytics view
    window.switchView("view-analytics");
  } catch (err) {
    setStatus("Prediction Error: " + err.message);
  }
}

function renderResults(result) {
  const best = result.top_crops?.[0];
  if (!best) return;

  const bestCropEl = document.getElementById("best-crop");
  if (bestCropEl) {
    const matchPct = (best.suitability_pct || (best.final_score * 100)).toFixed(1);
    const yieldHa = Number(best.expected_yield_t_ha || 1.45).toFixed(2);
    const profitHa = Math.round(best.profit_rs_per_ha || 42500).toLocaleString("en-IN");
    const waterNeed = best.water_need || "Medium";

    // Rotation and irrigation notes
    let extraNotes = "";
    if (best.mono_crop_penalty > 0) {
      extraNotes += `<span class="timing-badge timing-off" style="margin-right:6px">⚠️ Mono-Crop Penalty (-15%)</span>`;
    }
    if (best.irrigation_penalty > 0) {
      extraNotes += `<span class="timing-badge timing-off" style="margin-right:6px">💧 Irrigation Penalty</span>`;
    }

    bestCropEl.innerHTML = `
      <div class="rec-banner-tag">🏆 RECOMMENDED BEST CROP</div>
      <h3 class="crop-hero-title">🌾 ${best.crop}</h3>
      <p class="crop-meta-line">
        Sow in <strong>${best.sowing_month || "June - July"}</strong> → 
        Harvest in <strong>${best.harvest_month || "September - October"}</strong> (${best.duration_months || 3.5} months)
      </p>
      ${extraNotes ? `<div style="margin-bottom:8px">${extraNotes}</div>` : ""}
      <div class="crop-key-stats-grid">
        <div class="c-stat-box"><span>${currentLanguage === 'ta' ? 'பொருத்த விகிதம்' : 'Match Score'}</span><strong>${matchPct}%</strong></div>
        <div class="c-stat-box"><span>${currentLanguage === 'ta' ? 'எதிர்பார்க்கப்படும் மகசூல்' : 'Expected Yield'}</span><strong>${yieldHa} t/ha</strong></div>
        <div class="c-stat-box"><span>${currentLanguage === 'ta' ? 'நிகர இலாபம்' : 'Net Profit'}</span><strong>₹${profitHa}/ha</strong></div>
        <div class="c-stat-box"><span>${currentLanguage === 'ta' ? 'தண்ணீர் தேவை' : 'Water Need'}</span><strong>${waterNeed}</strong></div>
      </div>
      <div style="margin-top:14px">
        <button type="button" class="mobile-primary-btn" onclick="commitCropPlan('${best.crop}')">
          📅 <span>${currentLanguage === 'ta' ? 'விதைப்பு கால அட்டவணையை உருவாக்கவும்' : 'Commit & Generate Sowing Schedule'}</span>
        </button>
      </div>
    `;
  }

  // 22-Crop Matrix Table
  const tbody = document.querySelector("#results-table tbody");
  if (tbody && result.top_crops) {
    tbody.innerHTML = "";
    result.top_crops.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${item.crop}</strong></td>
        <td>${item.sowing_month || "—"}</td>
        <td>${item.harvest_month || "—"}</td>
        <td>${Number(item.expected_yield_t_ha || 0).toFixed(2)}</td>
        <td>₹${Number(item.adjusted_price_rs_per_kg || 40).toFixed(2)}</td>
        <td>₹${Math.round(item.profit_rs_per_ha || 0).toLocaleString("en-IN")}</td>
        <td>
          <button type="button" class="btn-pill-action" onclick="commitCropPlan('${item.crop}')">Plan</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Agronomic Fit / XAI
  const xaiEl = document.getElementById("local-explanation");
  if (xaiEl && best.advisory_notes) {
    xaiEl.innerHTML = `<ul style="margin:0;padding-left:18px;font-size:0.84rem;line-height:1.5">${best.advisory_notes.map(n => `<li>${n}</li>`).join("")}</ul>`;
  }

  const rejEl = document.getElementById("rejected-crops");
  if (rejEl && result.rejected_crops) {
    rejEl.innerHTML = result.rejected_crops.slice(0, 4).map(r => `<div>• <strong>${r.crop}</strong>: ${r.reason}</div>`).join("");
  }

  // Voice announcement of the recommendation
  const recMsg = currentLanguage === "ta"
    ? `உங்கள் நிலத்திற்கு மிகவும் பரிந்துரைக்கப்படும் பயிர் ${best.crop}. பொருத்த விகிதம் ${((best.suitability_pct || (best.final_score * 100))).toFixed(0)} சதவீதம்.`
    : `Recommended best crop for your field is ${best.crop} with match score of ${((best.suitability_pct || (best.final_score * 100))).toFixed(0)} percent.`;
  window.speakText(recMsg);
}

// ── Point 5: Sowing Schedule Generation & Task Checklist ────────────────────
window.commitCropPlan = async function(cropName) {
  const user = getLoggedInUser();
  if (!user) {
    // Show auth modal to capture mobile phone for WhatsApp alerts
    window.pendingCropName = cropName;
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("hidden");
    return;
  }
  await executeCommit(cropName, user.phone_number, user.full_name);
};

async function executeCommit(cropName, phone, name) {
  try {
    setStatus(`Generating dated sowing schedule for ${cropName}...`);
    const acres = areaHectares ? (areaHectares * 2.471) : 3.71;
    const today = new Date().toISOString().split("T")[0];

    const resp = await fetch("/api/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crop_name: cropName,
        sowing_date: today,
        area_acres: Number(acres.toFixed(2)),
        farmer_budget_inr: Math.round(acres * 35000),
        irrigation_source: document.getElementById("irrigation-select")?.value || "Borewell",
        farmer_phone: phone,
        farmer_name: name || "Farmer",
      }),
    });

    if (!resp.ok) throw new Error("Plan generation failed");
    const plan = await resp.json();
    currentCommittedPlan = plan;

    renderCommittedPlan(plan);
    setStatus(`✓ Sowing schedule committed for ${cropName}!`);

    // Voice announcement
    const msg = currentLanguage === "ta"
      ? `${cropName} பயிருக்கான விதைப்பு கால அட்டவணை உருவாக்கப்பட்டது.`
      : `Sowing schedule committed for ${cropName} across ${acres.toFixed(1)} acres.`;
    window.speakText(msg);

    // Switch to Schedule view
    window.switchView("view-schedule");
  } catch (err) {
    setStatus("Schedule Error: " + err.message);
  }
}

function renderCommittedPlan(plan) {
  if (!plan) return;
  const acres = plan.area_acres || (areaHectares * 2.471);
  const cost = plan.budget_analysis?.cost_breakdown?.total_recommended_budget_inr || (acres * 35000);

  document.getElementById("plan-crop-title").textContent = `📅 Sowing-to-Harvest Plan: ${plan.crop_name}`;
  document.getElementById("plan-subtitle").textContent = 
    `Plot: ${(acres / 2.471).toFixed(2)} ha (${acres.toFixed(1)} acres) · Duration: ${plan.duration_days || 85} Days · Est. Budget: ₹${Math.round(cost).toLocaleString("en-IN")}`;

  document.getElementById("plan-sowing-date").textContent = plan.sowing_date || "Today";
  document.getElementById("plan-harvest-date").textContent = plan.expected_harvest_date || "In 85 Days";

  // Render Tasks
  const container = document.getElementById("task-checklist");
  if (container && plan.tasks) {
    container.innerHTML = "";
    plan.tasks.forEach(task => {
      const isDone = !!task.is_completed;
      const card = document.createElement("div");
      card.className = `task-card ${isDone ? "completed" : ""}`;
      card.id = `task-card-${task.task_id}`;
      card.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px">
          <input type="checkbox" class="task-checkbox" ${isDone ? "checked" : ""}
                 onchange="toggleTaskDone('${plan.plan_id}', '${task.task_id}', this.checked)" />
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="task-stage-badge">${(task.task_type || "TASK").toUpperCase()} (Day ${task.day_offset})</span>
              <span class="task-date">${task.due_date}</span>
            </div>
            <h4 style="margin:6px 0 2px 0;font-size:0.95rem;color:#0f172a">${task.title}</h4>
            <p style="margin:0;font-size:0.82rem;color:#64748b">${task.description}</p>
            <div style="margin-top:6px;font-size:0.78rem;color:#15803d;font-weight:700">
              Est. Cost: ₹${Math.round(task.estimated_cost_inr || 1500).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render 1-Year Multi-Crop Rotation
  const rotGrid = document.getElementById("rotation-cycle-cards");
  if (rotGrid && plan.annual_rotation_cycle?.cycles) {
    rotGrid.innerHTML = "";
    plan.annual_rotation_cycle.cycles.forEach(c => {
      const rCard = document.createElement("div");
      rCard.className = "rotation-card";
      rCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#15803d">Cycle ${c.cycle_number}: ${c.crop_name} (${c.season_label})</strong>
          <span style="font-size:0.75rem;font-weight:700;color:#0f172a">${c.duration_days} Days</span>
        </div>
        <p style="margin:4px 0 0;font-size:0.8rem;color:#475569">${c.role} · Est. Profit: <strong>₹${Number(c.estimated_net_profit_inr || 0).toLocaleString('en-IN')}</strong></p>
        ${c.safety_gap_after ? `<div style="font-size:0.74rem;color:#b45309;margin-top:4px;font-weight:600">🌿 20-Day Soil Rest: ${c.safety_gap_after.activity}</div>` : ""}
      `;
      rotGrid.appendChild(rCard);
    });
  }
}

window.toggleTaskDone = async function(planId, taskId, isDone) {
  try {
    const card = document.getElementById(`task-card-${taskId}`);
    if (card) card.classList.toggle("completed", isDone);
    const statusTxt = isDone ? (currentLanguage === "ta" ? "பணி நிறைவடைந்தது ✓" : "Task completed ✓") : (currentLanguage === "ta" ? "பணி நிலுவையில் உள்ளது" : "Task pending");
    setStatus(statusTxt);

    if (isDone) {
      const taskTitle = card ? card.querySelector("h4")?.textContent || "பணி" : "பணி";
      const ttsMsg = currentLanguage === "ta"
        ? `${taskTitle} பணி முடிந்தது என பதிவு செய்யப்பட்டது.`
        : `Task recorded as completed.`;
      window.speakText(ttsMsg);
    }

    await fetch("/api/plan/task/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId, task_id: taskId, is_completed: isDone }),
    });
  } catch (e) {
    console.warn("Task toggle note:", e);
  }
};

// ── Point 3: Dedicated Chatbot with Attach, Send, Voice, and History ────────
window.askAssistant = async function(queryText, attachmentFile = null) {
  if (!queryText && !attachmentFile) return;
  const q = (queryText || "").trim();
  const cBox = document.getElementById("chat-messages");
  const aInp = document.getElementById("assistant-input");
  if (aInp) aInp.value = "";

  // Hide attachment preview chip
  const prevBox = document.getElementById("chat-attach-preview");
  if (prevBox) prevBox.classList.add("hidden");

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Append user bubble (with file tag if attached)
  if (cBox) {
    const uRow = document.createElement("div");
    uRow.className = "chat-bubble-row user-row";
    let fileHtml = "";
    if (attachmentFile) {
      fileHtml = `<div style="background:rgba(255,255,255,0.25);padding:4px 8px;border-radius:6px;font-size:0.75rem;margin-bottom:4px">📎 ${attachmentFile.name}</div>`;
    }
    uRow.innerHTML = `
      <div class="chat-bubble user-bubble">
        ${fileHtml}
        <div>${q || "Analyzed attachment"}</div>
        <div class="bubble-time">${timeStr} ✓✓</div>
      </div>
    `;
    cBox.appendChild(uRow);
    cBox.scrollTop = cBox.scrollHeight;
  }

  // Add loading indicator
  const loadId = "chat-loading-" + Date.now();
  if (cBox) {
    const lRow = document.createElement("div");
    lRow.className = "chat-bubble-row bot-row";
    lRow.id = loadId;
    lRow.innerHTML = `
      <div class="chat-avatar-icon">🌿</div>
      <div class="chat-bubble bot-bubble">
        <div>${currentLanguage === 'ta' ? 'ICAR / TNAU வேளாண்மை ஆலோசனை பெறப்படுகிறது...' : 'Consulting ICAR / TNAU Grounded Advisory...'}</div>
      </div>
    `;
    cBox.appendChild(lRow);
    cBox.scrollTop = cBox.scrollHeight;
  }

  try {
    let answerText = "";
    if (attachmentFile) {
      // Call file upload route
      const formData = new FormData();
      formData.append("file", attachmentFile);
      formData.append("query", q || "Diagnose this crop leaf / farm photo.");
      formData.append("language", currentLanguage);

      const resp = await fetch("/api/assistant/upload", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      answerText = data.analysis || "File received and analyzed.";
    } else {
      // Call text assistant query
      const cropCtx = currentCommittedPlan?.crop_name || "";
      const resp = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          crop_name: cropCtx,
          language: currentLanguage,
        }),
      });
      const data = await resp.json();
      answerText = data.answer || "No response received.";
    }

    document.getElementById(loadId)?.remove();

    if (cBox) {
      const bRow = document.createElement("div");
      bRow.className = "chat-bubble-row bot-row";
      bRow.innerHTML = `
        <div class="chat-avatar-icon">🌿</div>
        <div class="chat-bubble bot-bubble">
          <div>${answerText.replace(/\n/g, "<br/>")}</div>
          <div class="bubble-time">${timeStr}</div>
        </div>
      `;
      cBox.appendChild(bRow);
      cBox.scrollTop = cBox.scrollHeight;
    }

    // Speak the answer with TTS (Tamil voice if Tamil active)
    window.speakText(answerText);
    currentAttachmentFile = null;
  } catch (err) {
    document.getElementById(loadId)?.remove();
    if (cBox) {
      const eRow = document.createElement("div");
      eRow.className = "chat-bubble-row bot-row";
      eRow.innerHTML = `
        <div class="chat-avatar-icon">⚠️</div>
        <div class="chat-bubble bot-bubble" style="background:#fee2e2;color:#991b1b">
          <div>Error: ${err.message}</div>
        </div>
      `;
      cBox.appendChild(eRow);
    }
  }
};

window.fillAndAsk = function(question) {
  window.switchView("view-chat");
  const inp = document.getElementById("assistant-input");
  if (inp) inp.value = question;
  window.askAssistant(question);
};

// Setup Voice Input (SpeechRecognition)
let recognition = null;
function setupVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  const vBtn = document.getElementById("assistant-voice-btn");
  if (!vBtn) return;

  recognition.onstart = () => {
    vBtn.classList.add("recording-pulse");
    setStatus(currentLanguage === 'ta' ? "கேட்கிறது... தமிழில் பேசவும்..." : "Listening... Speak your farming question...");
  };

  recognition.onend = () => {
    vBtn.classList.remove("recording-pulse");
  };

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    const inp = document.getElementById("assistant-input");
    if (inp) inp.value = text;
    window.askAssistant(text, currentAttachmentFile);
  };

  vBtn.addEventListener("click", () => {
    try {
      recognition.lang = currentLanguage === "ta" ? "ta-IN" : "en-IN";
      recognition.start();
    } catch (e) {
      recognition.stop();
    }
  });
}

// ── Point 6: Professional Authentication & OTP ──────────────────────────────
function getLoggedInUser() {
  try {
    const raw = localStorage.getItem("cropai_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function updateProfileUI() {
  const user = getLoggedInUser() || { full_name: "Farmer", phone_number: "" };
  const initial = (user.full_name || "F").charAt(0).toUpperCase();

  const hInit = document.getElementById("header-avatar-initial");
  if (hInit) hInit.textContent = initial;
  const dInit = document.getElementById("d-avatar-initial");
  if (dInit) dInit.textContent = initial;
  const sAvatar = document.getElementById("settings-avatar");
  if (sAvatar) sAvatar.textContent = initial;

  const displayName = user.full_name || "Farmer";
  const displayPhone = user.phone_number || "";

  const mName = document.getElementById("menu-user-name");
  if (mName) mName.textContent = displayName;
  const mPhone = document.getElementById("menu-user-phone");
  if (mPhone) mPhone.textContent = displayPhone;

  const dName = document.getElementById("d-farmer-name");
  if (dName) dName.textContent = displayName;
  const dPhone = document.getElementById("d-farmer-phone");
  if (dPhone) dPhone.textContent = displayPhone;

  const sName = document.getElementById("settings-name-display");
  if (sName) sName.textContent = displayName;
  const sPhone = document.getElementById("settings-contact-display");
  if (sPhone) sPhone.textContent = displayPhone;

  // Update input fields in settings
  const nameInput = document.getElementById("set-farmer-name");
  if (nameInput && user.full_name && user.full_name !== "Farmer") nameInput.value = user.full_name;
  const phoneInput = document.getElementById("set-farmer-phone");
  if (phoneInput && user.phone_number) phoneInput.value = user.phone_number;
}

function handleLogout() {
  localStorage.removeItem("cropai_user");
  currentCommittedPlan = null;

  // Reset chat messages to greeting only
  const cBox = document.getElementById("chat-messages");
  if (cBox) {
    cBox.innerHTML = `
      <div class="chat-bubble-row bot-row">
        <div class="chat-avatar-icon">🌿</div>
        <div class="chat-bubble bot-bubble">
          <div class="bubble-title">${I18N[currentLanguage].bot_greeting_title}</div>
          <div class="bubble-text">${I18N[currentLanguage].bot_greeting_body}</div>
          <div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    `;
  }

  updateProfileUI();
  window.switchView("view-home");
  setStatus("Logged out successfully. Switched to guest session.");
  const pMenu = document.getElementById("profile-dropdown-menu");
  if (pMenu) pMenu.classList.add("hidden");
}

function setupAuthHandlers() {
  const sendBtn = document.getElementById("send-otp-btn");
  const verifyBtn = document.getElementById("verify-otp-btn");
  const otpGroup = document.getElementById("otp-input-group");
  const phoneInp = document.getElementById("auth-phone-input");
  const otpInp = document.getElementById("auth-otp-input");
  const hintEl = document.getElementById("otp-status-hint");

  sendBtn?.addEventListener("click", async () => {
    const raw = phoneInp.value.trim().replace(/\D/g, "");
    if (raw.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    const phone = "+91" + raw;
    sendBtn.textContent = "Sending...";

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();
      otpGroup.classList.remove("hidden");
      sendBtn.classList.add("hidden");
      verifyBtn.classList.remove("hidden");
      hintEl.textContent = `✓ OTP sent to ${phone}. Enter code or demo code 1234.`;
      setStatus(`✓ Verification code sent to ${phone}`);
    } catch (e) {
      alert("Failed to send verification code. Please retry.");
    } finally {
      sendBtn.textContent = I18N[currentLanguage].send_otp_btn;
    }
  });

  verifyBtn?.addEventListener("click", async () => {
    const raw = phoneInp.value.trim().replace(/\D/g, "");
    const code = otpInp.value.trim();
    if (!code) {
      alert("Please enter the verification code.");
      return;
    }
    verifyBtn.textContent = "Verifying...";
    const phone = "+91" + raw;

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone,
          otp_code: code,
          full_name: "santhosh",
        }),
      });
      if (!res.ok) throw new Error("Invalid or expired OTP");
      const data = await res.json();

      const user = data.user || { phone_number: phone, full_name: "santhosh" };
      localStorage.setItem("cropai_user", JSON.stringify(user));
      updateProfileUI();

      document.getElementById("auth-modal")?.classList.add("hidden");
      setStatus("✓ Signed in successfully as verified farmer!");

      if (window.pendingCropName) {
        executeCommit(window.pendingCropName, phone, user.full_name);
        window.pendingCropName = null;
      }
    } catch (e) {
      alert("Verification failed: " + e.message);
    } finally {
      verifyBtn.textContent = I18N[currentLanguage].verify_login_btn;
    }
  });

  document.getElementById("auth-modal-close")?.addEventListener("click", () => {
    document.getElementById("auth-modal")?.classList.add("hidden");
  });

  document.getElementById("google-signin-btn")?.addEventListener("click", () => {
    // Google auth - saves session without hardcoded number
    const user = { phone_number: "", full_name: "Farmer", auth_provider: "google" };
    localStorage.setItem("cropai_user", JSON.stringify(user));
    updateProfileUI();
    document.getElementById("auth-modal")?.classList.add("hidden");
    setStatus("✓ Signed in via Google! Update your phone in Settings for alerts.");
    if (window.pendingCropName) {
      executeCommit(window.pendingCropName, user.phone_number, user.full_name);
      window.pendingCropName = null;
    }
  });
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

// ── Master DOM Ready Initialization ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup UI navigation events
  document.querySelectorAll(".bottom-nav-item").forEach(btn => {
    btn.addEventListener("click", () => window.switchView(btn.dataset.view));
  });
  document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
    btn.addEventListener("click", () => window.switchView(btn.dataset.view));
  });

  // Floating AI Button click -> opens dedicated chat screen
  document.getElementById("floating-chat-btn")?.addEventListener("click", () => {
    window.switchView("view-chat");
  });

  // Chat Back Button click -> returns to previous screen
  document.getElementById("chat-back-btn")?.addEventListener("click", () => {
    window.switchView(window.previousView || "view-home");
  });

  // Prediction action buttons
  document.getElementById("predict-btn")?.addEventListener("click", runPredict);
  document.getElementById("analytics-to-schedule-btn")?.addEventListener("click", () => {
    const bestCropName = document.querySelector(".crop-hero-title")?.textContent?.replace(/[^\w\s]/gi, "").trim() || "Blackgram";
    commitCropPlan(bestCropName);
  });

  // Soil Type auto-fill
  document.getElementById("soil-type-select")?.addEventListener("change", e => {
    const preset = SOIL_PRESETS[e.target.value];
    if (preset) {
      Object.entries(preset).forEach(([k, v]) => setSliderValue(k, v));
      setStatus(`Calibrated N/P/K/pH for soil: ${e.target.value}`);
    }
  });

  // Map Drawing toolbar controls
  document.getElementById("draw-polygon-btn")?.addEventListener("click", () => {
    new L.Draw.Polygon(map).enable();
    setStatus("Click on map to draw polygon corners, double-click to finish.");
  });
  document.getElementById("draw-rectangle-btn")?.addEventListener("click", () => {
    new L.Draw.Rectangle(map).enable();
    setStatus("Click and drag on map to draw rectangle.");
  });
  document.getElementById("draw-circle-btn")?.addEventListener("click", () => {
    new L.Draw.Circle(map).enable();
    setStatus("Click and drag on map to draw circle.");
  });
  document.getElementById("clear-map-btn")?.addEventListener("click", () => {
    if (drawnItems) drawnItems.clearLayers();
    if (anchorMarker) map.removeLayer(anchorMarker);
    document.getElementById("area-display").textContent = "1.500 ha (3.71 ac)";
    areaHectares = 1.5;
    setStatus("Cleared drawn boundary. Reset to default 1.5 ha.");
  });
  document.getElementById("locate-btn")?.addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        map.setView([lat, lng], 16);
        updateMapLocation(lat, lng);
      }, () => {
        updateMapLocation(20.5937, 78.9629);
      });
    }
  });

  // Language Switchers
  const toggleLang = () => {
    const next = currentLanguage === "en" ? "ta" : "en";
    window.setLanguage(next);
  };
  document.getElementById("header-lang-btn")?.addEventListener("click", toggleLang);
  document.getElementById("d-lang-toggle-btn")?.addEventListener("click", toggleLang);
  document.getElementById("menu-lang-toggle-btn")?.addEventListener("click", toggleLang);
  document.getElementById("set-language")?.addEventListener("change", e => {
    window.setLanguage(e.target.value);
  });

  // Profile Dropdown Toggle
  const avatarBtn = document.getElementById("header-avatar-btn");
  const profileMenu = document.getElementById("profile-dropdown-menu");
  avatarBtn?.addEventListener("click", e => {
    e.stopPropagation();
    profileMenu?.classList.toggle("hidden");
  });
  document.addEventListener("click", () => {
    profileMenu?.classList.add("hidden");
  });

  // Logout Handlers
  document.getElementById("menu-logout-btn")?.addEventListener("click", handleLogout);
  document.getElementById("d-logout-btn")?.addEventListener("click", handleLogout);

  // Chat Input and Send
  const sendBtn = document.getElementById("assistant-send-btn");
  const aInp = document.getElementById("assistant-input");
  sendBtn?.addEventListener("click", () => {
    window.askAssistant(aInp.value, currentAttachmentFile);
  });
  aInp?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      window.askAssistant(aInp.value, currentAttachmentFile);
    }
  });

  // Chat File Attachment (Point 3)
  const attachBtn = document.getElementById("assistant-attach-btn");
  const fileInp = document.getElementById("chat-file-input");
  const attachPrev = document.getElementById("chat-attach-preview");
  const attachName = document.getElementById("attach-preview-name");
  const attachRemove = document.getElementById("attach-remove-btn");

  attachBtn?.addEventListener("click", () => fileInp?.click());
  fileInp?.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) {
      currentAttachmentFile = e.target.files[0];
      attachPrev.classList.remove("hidden");
      attachName.textContent = currentAttachmentFile.name;
    }
  });
  attachRemove?.addEventListener("click", () => {
    currentAttachmentFile = null;
    fileInp.value = "";
    attachPrev.classList.add("hidden");
  });

  // 2. Initialize Components
  initMap();
  renderSliders();
  setupVoiceInput();
  setupAuthHandlers();
  updateProfileUI();
  window.setLanguage(currentLanguage);

  // Auto-geolocate on startup: fetches live soil/climate for user's real location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        map.setView([lat, lng], 14);
        updateMapLocation(lat, lng);
      },
      () => {
        // Silent fail - keep default India center
        console.log("Geolocation denied, using default center.");
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  console.log("CropAI PWA Platform fully initialized.");
});
