export const ERROR_TRANSLATIONS = {
    // Connection / Network
    "default": {
        en: "Something went wrong. Please try again.",
        te: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
    },
    "connection delayed": {
        en: "Connection Delayed. The database is waking up.",
        te: "కనెక్షన్ ఆలస్యం అవుతోంది. డేటాబేస్ సిద్ధమవుతోంది, దయచేసి వేచి ఉండండి."
    },
    "timed out": {
        en: "Connection Timed Out. Please check your internet.",
        te: "కనెక్షన్ సమయం ముగిసింది. దయచేసి మీ ఇంటర్నెట్‌ని తనిఖీ చేయండి."
    },
    "failed to fetch": {
        en: "Failed to connect to the server.",
        te: "సర్వర్‌కి కనెక్ట్ చేయడంలో విఫలమైంది."
    },
    // Auth / Session
    "failed to initialize secure session": {
        en: "Could not log you in securely. Please try reloading.",
        te: "సురక్షితంగా లాగిన్ చేయడం సాధ్యం కాలేదు. దయచేసి పేజీని రీలోడ్ చేయండి."
    },
    "user not found": {
        en: "User not found. Please sign up.",
        te: "వినియోగదారు కనుగొనబడలేదు. దయచేసి సైన్ అప్ చేయండి."
    },
    "invalid login credentials": {
        en: "Invalid email or password.",
        te: "తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్."
    },
    // Database
    "database schema missing": {
        en: "System Error: Database setup is incomplete.",
        te: "సిస్టమ్ లోపం: డేటాబేస్ సెటప్ పూర్తి కాలేదు."
    }
};

export function getTranslatedError(errorMsg: string | null, lang: 'en' | 'te'): { title: string, message: string } {
    if (!errorMsg) return { title: "", message: "" };

    const lowerMsg = errorMsg.toLowerCase();

    // Default fallback
    let trans = ERROR_TRANSLATIONS["default"][lang];
    let title = lang === 'en' ? "Error" : "లోపం";

    // Match keywords
    if (lowerMsg.includes("time") || lowerMsg.includes("timeout")) {
        trans = ERROR_TRANSLATIONS["timed out"][lang];
        title = lang === 'en' ? "Connection Timeout" : "కనెక్షన్ సమయం ముగిసింది";
    } else if (lowerMsg.includes("connection connection") || lowerMsg.includes("delayed")) {
        trans = ERROR_TRANSLATIONS["connection delayed"][lang];
        title = lang === 'en' ? "Connection Delayed" : "కనెక్షన్ ఆలస్యం";
    } else if (lowerMsg.includes("schema") || lowerMsg.includes("profiles")) {
        trans = ERROR_TRANSLATIONS["database schema missing"][lang];
        title = lang === 'en' ? "System Error" : "సిస్టమ్ లోపం";
    } else if (lowerMsg.includes("initialize")) {
        trans = ERROR_TRANSLATIONS["failed to initialize secure session"][lang];
        title = lang === 'en' ? "Login Error" : "లాగిన్ లోపం";
    }

    // Pass through original if minimal match (optional, but requested specific messages)
    // If we have a specific translation, return it.

    return { title, message: trans };
}
