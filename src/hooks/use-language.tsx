import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "en" | "te";

/** Master English → Telugu dictionary for repeated, well-known strings.
 *  Component code can also pass an inline Telugu via t(en, te) for one-offs. */
const DICT: Record<string, string> = {
  // Status
  Draft: "డ్రాఫ్ట్",
  Submitted: "సమర్పించబడింది",
  Assigned: "కేటాయించబడింది",
  "In Review": "సమీక్షలో",
  "Work In Progress": "పనిలో ఉంది",
  Resolved: "పరిష్కరించబడింది",
  Closed: "మూసివేయబడింది",
  Reopened: "తిరిగి తెరవబడింది",
  Escalated: "ఎస్కలేట్ చేయబడింది",
  Rejected: "తిరస్కరించబడింది",
  // Priority
  Low: "తక్కువ",
  Medium: "మధ్యమ",
  High: "ఎక్కువ",
  Critical: "క్లిష్టమైన",
  low: "తక్కువ",
  medium: "మధ్యమ",
  high: "ఎక్కువ",
  critical: "క్లిష్టమైన",
  // Categories
  Welfare: "సంక్షేమం",
  Development: "అభివృద్ధి",
  Regulation: "నియంత్రణ",
  welfare: "సంక్షేమం",
  development: "అభివృద్ధి",
  regulation: "నియంత్రణ",
  // Roles
  Citizen: "పౌరుడు",
  "Super Admin": "సూపర్ అడ్మిన్",
  "Welfare Coordinator": "సంక్షేమ సమన్వయకర్త",
  "Development Coordinator": "అభివృద్ధి సమన్వయకర్త",
  "Regulation Coordinator": "నియంత్రణ సమన్వయకర్త",
  // Common UI
  Dashboard: "డాష్‌బోర్డ్",
  Complaints: "ఫిర్యాదులు",
  Complaint: "ఫిర్యాదు",
  "Raise Grievance": "ఫిర్యాదు చేయండి",
  "Raise a complaint": "ఫిర్యాదు నమోదు చేయండి",
  "Coordinator Desk": "సమన్వయ డెస్క్",
  "Admin Portal": "అడ్మిన్ పోర్టల్",
  "Citizen Portal": "పౌర పోర్టల్",
  "Sign in": "లాగిన్",
  "Sign out": "నిష్క్రమించండి",
  Register: "నమోదు",
  "Get started": "ప్రారంభించండి",
  Home: "హోమ్",
  "Contact Us": "సంప్రదించండి",
  "About Us": "మా గురించి",
  "FAQ/Help": "సహాయం",
  Transparency: "పారదర్శకత",
  "Loading…": "లోడ్ అవుతోంది…",
  Save: "సేవ్ చేయండి",
  Cancel: "రద్దు చేయండి",
  Submit: "సమర్పించండి",
  "Submit complaint": "ఫిర్యాదును సమర్పించండి",
  "Update status": "స్థితిని మార్చండి",
  Escalate: "ఎస్కలేట్ చేయండి",
  Close: "మూసివేయండి",
  Reopen: "తిరిగి తెరవండి",
  Search: "శోధించండి",
  Filters: "ఫిల్టర్లు",
  "All categories": "అన్ని విభాగాలు",
  "All departments": "అన్ని శాఖలు",
  "All statuses": "అన్ని స్థితులు",
  "All priorities": "అన్ని ప్రాధాన్యతలు",
  "All roles": "అన్ని పాత్రలు",
  Title: "శీర్షిక",
  Description: "వివరణ",
  Category: "విభాగం",
  Priority: "ప్రాధాన్యత",
  Status: "స్థితి",
  Code: "కోడ్",
  Created: "సృష్టించబడింది",
  Date: "తేదీ",
  Department: "శాఖ",
  "Ward / Village": "వార్డు / గ్రామం",
  Ward: "వార్డు",
  "Contact phone": "సంప్రదింపు ఫోన్",
  "Location / landmark": "ప్రదేశం / గుర్తు",
  Email: "ఇమెయిల్",
  Password: "పాస్‌వర్డ్",
  "Full name": "పూర్తి పేరు",
  Welcome: "స్వాగతం",
  "Welcome back": "తిరిగి స్వాగతం",
  "Continue with Google": "Google తో కొనసాగండి",
  "Create account": "ఖాతా సృష్టించండి",
  "View all": "అన్నీ చూడండి",
  "Back to dashboard": "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి",
  "Back to complaints": "ఫిర్యాదులకు తిరిగి వెళ్ళండి",
  "Go home": "హోమ్‌కు వెళ్ళండి",
  "Try again": "మళ్ళీ ప్రయత్నించండి",
  "Page not found": "పేజీ కనుగొనబడలేదు",
  Active: "క్రియాశీలం",
  Pending: "పెండింగ్",
  Open: "తెరిచిన",
  Total: "మొత్తం",
  "This Year": "ఈ సంవత్సరం",
  "This Month": "ఈ నెల",
  Incoming: "రాబోతున్నవి",
  "Recently Resolved": "ఇటీవల పరిష్కరించబడినవి",
  "Recently Updated": "ఇటీవల నవీకరించబడినవి",
  "Recent Grievances": "ఇటీవలి ఫిర్యాదులు",
  Departments: "శాఖలు",
  "In Progress": "పనిలో",
  "Activity & messages": "కార్యకలాపం & సందేశాలు",
  "Coordinator actions": "సమన్వయకర్త చర్యలు",
  "Citizen Dashboard": "పౌర డాష్‌బోర్డ్",
  "Grievance Overview": "ఫిర్యాదుల అవలోకనం",
  "Grievance Queue": "ఫిర్యాదుల క్యూ",
  Grievances: "ఫిర్యాదులు",
  "All Complaints": "అన్ని ఫిర్యాదులు",
  "Complaint details": "ఫిర్యాదు వివరాలు",
  "Public Transparency Dashboard": "పబ్లిక్ పారదర్శకత డాష్‌బోర్డ్",
  "Total Complaints": "మొత్తం ఫిర్యాదులు",
  "Resolution Rate": "పరిష్కార రేటు",
  "Department Statistics": "శాఖల గణాంకాలు",
  "Status Distribution": "స్థితి విభజన",
  "Monthly Trends": "నెలవారీ ధోరణులు",
  "Avg Satisfaction": "సగటు సంతృప్తి",
  "Avg Resolution": "సగటు పరిష్కారం",
  Satisfaction: "సంతృప్తి",
  "Admin Dashboard": "అడ్మిన్ డాష్‌బోర్డ్",
  "User Management": "వినియోగదారు నిర్వహణ",
  "Complaint Management": "ఫిర్యాదుల నిర్వహణ",
  "Escalation Management": "ఎస్కలేషన్ నిర్వహణ",
  "Citizen Feedback": "పౌర అభిప్రాయం",
  Reports: "నివేదికలు",
  Users: "వినియోగదారులు",
  Feedback: "అభిప్రాయం",
  Escalations: "ఎస్కలేషన్లు",
  New: "కొత్త",
  Send: "పంపండి",
  Update: "నవీకరించండి",
  Updated: "నవీకరించబడింది",
  Suspended: "నిలిపివేయబడింది",
  Joined: "చేరారు",
  Actions: "చర్యలు",
  User: "వినియోగదారు",
  Role: "పాత్ర",
  "Last update": "చివరి నవీకరణ",
  Location: "ప్రదేశం",
  Contact: "సంప్రదింపు",
  Coordinator: "సమన్వయకర్త",
  "Resolution Performance": "పరిష్కార పనితీరు",
  "Complaint Status Distribution": "ఫిర్యాదు స్థితి విభజన",
  "Department Volume": "శాఖ పరిమాణం",
  "Department-wise Complaints": "శాఖల వారీగా ఫిర్యాదులు",
  "Average Rating": "సగటు రేటింగ్",
  "Feedback Trend": "అభిప్రాయ ధోరణి",
  "Recent Comments": "ఇటీవలి వ్యాఖ్యలు",
  "Generate and export operational reports.":
    "కార్యాచరణ నివేదికలను రూపొందించండి మరియు ఎగుమతి చేయండి.",
  Configure: "కాన్ఫిగర్",
  From: "నుండి",
  To: "వరకు",
  "Run escalation now": "ఇప్పుడు ఎస్కలేషన్ నడపండి",
  "Escalated Complaints": "ఎస్కలేట్ చేయబడిన ఫిర్యాదులు",
  "At Risk (5+ days)": "ప్రమాదంలో (5+ రోజులు)",
  "Rule Threshold": "నియమ పరిమితి",
  "Seed demo data": "డెమో డేటా జోడించండి",
  "Average satisfaction over last 6 months.": "గత 6 నెలల్లో సగటు సంతృప్తి.",
  "Operational overview across all departments.": "అన్ని శాఖల కార్యాచరణ అవలోకనం.",
  "Last 6 months.": "గత 6 నెలలు.",
  "Distribution across departments.": "శాఖల్లో విభజన.",
  "Bar comparison.": "బార్ పోలిక.",
  "Coordinator productivity by department.": "శాఖ ప్రకారం సమన్వయకర్త ఉత్పాదకత.",
  "Submit feedback": "అభిప్రాయాన్ని సమర్పించండి",
  "Rate this resolution": "ఈ పరిష్కారాన్ని రేట్ చేయండి",
  "Your feedback": "మీ అభిప్రాయం",
  "Tap a star": "ఒక నక్షత్రాన్ని నొక్కండి",
  "Share your experience (optional)…": "మీ అనుభవాన్ని పంచుకోండి (ఐచ్ఛికం)…",
  "Write a message…": "ఒక సందేశాన్ని వ్రాయండి…",
  "Search code, title, location…": "కోడ్, శీర్షిక, ప్రదేశం శోధించండి…",
  "Search by title, code or location…": "శీర్షిక, కోడ్ లేదా ప్రదేశం ద్వారా శోధించండి…",
  "Search name, email, ward…": "పేరు, ఇమెయిల్, వార్డు శోధించండి…",
  "Search…": "శోధించండి…",
  "Provide clear information to help us resolve it quickly.":
    "త్వరగా పరిష్కరించడానికి స్పష్టమైన సమాచారాన్ని అందించండి.",
  "It will be routed to the appropriate coordinator.": "ఇది తగిన సమన్వయకర్తకు పంపబడుతుంది.",
  "Aggregated, anonymised statistics — no personal data is shown.":
    "సమగ్ర, అనామిక గణాంకాలు — వ్యక్తిగత డేటా చూపబడదు.",
  "Pensions, ration, scholarships": "పెన్షన్లు, రేషన్, ఉపకారవేతనాలు",
  "Roads, drainage, public works": "రోడ్లు, డ్రైనేజీ, ప్రజా పనులు",
  "Certificates, permits, approvals": "సర్టిఫికెట్లు, అనుమతులు, ఆమోదాలు",
  "Pensions, ration cards, scholarships, and social schemes.":
    "పెన్షన్లు, రేషన్ కార్డులు, ఉపకారవేతనాలు మరియు సామాజిక పథకాలు.",
  "Roads, drainage, sanitation, water supply, public works.":
    "రోడ్లు, డ్రైనేజీ, పారిశుద్ధ్యం, నీటి సరఫరా, ప్రజా పనులు.",
  "Certificates, licenses, permits, and approvals.":
    "సర్టిఫికెట్లు, లైసెన్స్‌లు, అనుమతులు మరియు ఆమోదాలు.",
  "Three departments. One portal.": "మూడు శాఖలు. ఒకే పోర్టల్.",
  "Your voice. Tracked. Resolved.": "మీ గొంతు. ట్రాక్ చేయబడింది. పరిష్కరించబడింది.",
  "Track a complaint": "ఫిర్యాదును ట్రాక్ చేయండి",
  "Sign in to manage complaints, or create a new citizen account.":
    "ఫిర్యాదులు నిర్వహించడానికి లాగిన్ అవ్వండి లేదా కొత్త పౌర ఖాతాను సృష్టించండి.",
  "Government of the People": "ప్రజల ప్రభుత్వం",
  "No further transitions": "తదుపరి మార్పులు లేవు",
  "Change status to…": "స్థితిని మార్చు…",
  "No activity yet.": "ఇంకా కార్యకలాపం లేదు.",
  "No complaints match these filters.": "ఈ ఫిల్టర్లకు ఫిర్యాదులు సరిపోలేదు.",
  "No complaints match.": "ఫిర్యాదులు సరిపోలేదు.",
  "No users match.": "వినియోగదారులు సరిపోలేదు.",
  "No written feedback yet.": "ఇంకా వ్రాతపూర్వక అభిప్రాయం లేదు.",
  "No escalated complaints.": "ఎస్కలేట్ చేయబడిన ఫిర్యాదులు లేవు.",
  "You haven't raised any complaints yet.": "మీరు ఇంకా ఏ ఫిర్యాదులు నమోదు చేయలేదు.",
  "Raise your first complaint": "మీ మొదటి ఫిర్యాదును నమోదు చేయండి",
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, te?: string) => string;
  tStatus: (s: string) => string;
  tCategory: (c: string) => string;
  tPriority: (p: string) => string;
  formatDate: (d: string | number | Date, opts?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (d: string | number | Date) => string;
};

const STATUS_TE: Record<string, string> = {
  draft: "డ్రాఫ్ట్",
  submitted: "సమర్పించబడింది",
  assigned: "కేటాయించబడింది",
  in_review: "సమీక్షలో",
  work_in_progress: "పనిలో ఉంది",
  resolved: "పరిష్కరించబడింది",
  closed: "మూసివేయబడింది",
  reopened: "తిరిగి తెరవబడింది",
  escalated: "ఎస్కలేట్ చేయబడింది",
  rejected: "తిరస్కరించబడింది",
};
const STATUS_EN: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  assigned: "Assigned",
  in_review: "In Review",
  work_in_progress: "Work In Progress",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
  escalated: "Escalated",
  rejected: "Rejected",
};

const Context = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
  tStatus: (s) => STATUS_EN[s] ?? s,
  tCategory: (c) => c,
  tPriority: (p) => p,
  formatDate: (d) => new Date(d).toLocaleDateString(),
  formatDateTime: (d) => new Date(d).toLocaleString(),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gs.lang") as Lang | null;
      if (saved === "te" || saved === "en") setLangState(saved);
    } catch (err) {
      // localStorage may throw in private browsing or SSR — safe to ignore; defaults to "en".
      console.warn("Could not read language from localStorage", err);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      try {
        localStorage.setItem("gs.lang", l);
      } catch (err) {
        // localStorage may throw in private browsing — state still updates in-memory.
        console.warn("Could not persist language to localStorage", err);
      }
    };
    const t = (en: string, te?: string) => {
      if (lang !== "te") return en;
      if (te) return te;
      return DICT[en] ?? en;
    };
    const tStatus = (s: string) => (lang === "te" ? (STATUS_TE[s] ?? s) : (STATUS_EN[s] ?? s));
    const tCategory = (c: string) => {
      const cap = c ? c[0].toUpperCase() + c.slice(1) : c;
      return lang === "te" ? (DICT[c] ?? DICT[cap] ?? cap) : cap;
    };
    const tPriority = (p: string) => {
      const cap = p ? p[0].toUpperCase() + p.slice(1) : p;
      return lang === "te" ? (DICT[p] ?? DICT[cap] ?? cap) : cap;
    };
    const locale = lang === "te" ? "te-IN" : "en-IN";
    const formatDate = (d: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
      new Date(d).toLocaleDateString(locale, opts);
    const formatDateTime = (d: string | number | Date) => new Date(d).toLocaleString(locale);
    return { lang, setLang, t, tStatus, tCategory, tPriority, formatDate, formatDateTime };
  }, [lang]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useLanguage = () => useContext(Context);
