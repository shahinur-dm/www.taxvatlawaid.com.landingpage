export type Locale = "en" | "bn";

export const FIRM_INFO = {
  name: "TaxVat LawAid",
  associatedPractice: "TaxAid",
  tagline: "Your Trusted Partner in Tax, VAT, Customs & Corporate Legal Solutions",
  taglineBn: "আয়কর, ভ্যাট, কাস্টমস ও কর্পোরেট আইনি সমাধানে আপনার বিশ্বস্ত অংশীদার",
  website: "https://www.taxvatlawaid.com",
  existingVercelSite: "https://www-taxvatlawaid-com.vercel.app/",
  email: "taxvatlawaid@gmail.com",
  phones: [
    { display: "+880 1614-446444", raw: "01614446444", tel: "+8801614446444" },
    { display: "+880 1343-226633", raw: "01343226633", tel: "+8801343226633" },
  ],
  whatsapp: {
    display: "+880 1614-446444",
    raw: "8801614446444",
    url: "https://wa.me/8801614446444?text=Hello%20TaxVat%20LawAid%2C%20I%20would%20like%20to%20request%20a%20legal%20consultation.",
  },
  address: {
    line1: "14/7, Eastern Mansion, Lift-14",
    line2: "67/9, Pioneer Road, Ramna, Dhaka",
    country: "Bangladesh",
    full: "14/7, Eastern Mansion, Lift-14, 67/9, Pioneer Road, Ramna, Dhaka, Bangladesh",
    fullBn: "১৪/৭, ইস্টার্ন ম্যানশন, লিফট-১৪, ৬৭/৯, পাইওনিয়ার রোড, রমনা, ঢাকা, বাংলাদেশ",
    mapsQuery:
      "https://www.google.com/maps/search/?api=1&query=Eastern+Mansion+Pioneer+Road+Ramna+Dhaka+Bangladesh",
    mapsEmbed:
      "https://www.google.com/maps?q=Eastern+Mansion+Pioneer+Road+Ramna+Dhaka+Bangladesh&output=embed",
  },
  hours: {
    en: "Sunday – Thursday, 3:00 PM – 8:00 PM (BST)",
    bn: "রবিবার – বৃহস্পতিবার, বিকাল ৩:০০ – রাত ৮:০০ (বাংলাদেশ সময়)",
    closedEn: "Closed Friday & Saturday",
    closedBn: "শুক্রবার ও শনিবার বন্ধ",
  },
  leadCounsel: {
    name: "Hossain Ahmed (Khan)",
    nameBn: "হোসাইন আহমেদ (খান)",
    role: "Lead Counsel & Proprietor",
    roleBn: "প্রধান আইনজীবী ও স্বত্বাধিকারী",
    credentials: "B.A, (Hon's) M.A, LL.B, LL.M.",
    title: "Advocate & Tax Consultant",
    titleBn: "অ্যাডভোকেট ও ট্যাক্স কনসালট্যান্ট",
    specialisationLine:
      "TAX-VAT, RJSC-Company Legal Compliance • Appeal, Tribunal, High Court & Writ Petition",
    specialisationLineBn:
      "আয়কর-ভ্যাট, আরজেএসসি-কোম্পানি আইনি কমপ্লায়েন্স • আপিল, ট্রাইব্যুনাল, হাইকোর্ট ও রিট পিটিশন",
    pillarsEn: [
      "Income Tax & Corporate Tax Advisory, Assessments, Audits & Appeals",
      "VAT, Supplementary Duty, 13-Digit BIN, Mushak 9.1 & VDS Compliance",
      "RJSC Company Incorporation, OPC, Partnerships, Annual Returns & Governance",
      "Appellate Tribunals (Taxes & CEVAT), High Court Division & Constitutional Writ Petitions",
    ],
    pillarsBn: [
      "ব্যক্তিগত ও কর্পোরেট আয়কর পরামর্শ, অ্যাসেসমেন্ট, অডিট ও আপিল পরিচালনা",
      "ভ্যাট, সম্পূরক শুল্ক, ১৩-ডিজিট বিআইএন, মূসক ৯.১ ও ভিডিএস কমপ্লায়েন্স",
      "আরজেএসসি কোম্পানি নিবন্ধন, ওপিসি, পার্টনারশিপ, বার্ষিক রিটার্ন ও কর্পোরেট গভর্ন্যান্স",
      "ট্যাক্স ও ভ্যাট আপিলাত ট্রাইব্যুনাল, হাইকোর্ট বিভাগ এবং সাংবিধানিক রিট পিটিশন",
    ],
  },
} as const;

export const CLIENT_TYPES = [
  "Business Owner / Proprietor",
  "Company Director / Corporate",
  "Entrepreneur / Startup Founder",
  "Importer / Exporter / Trader",
  "VAT-Registered Business (BIN Holder)",
  "Individual Taxpayer / Professional",
  "Foreign Investor / Joint Venture",
  "NGO / Society / Foundation / Association",
  "Individual Seeking Legal Representation",
] as const;

export const SERVICE_CATEGORIES = [
  "Income Tax & Corporate Tax (e-TIN, Returns, TDS, Audit)",
  "VAT & Supplementary Duty (e-BIN, Mushak 9.1, VDS, Audit)",
  "Customs & International Trade (HS Code, Valuation, Disputes)",
  "RJSC Company & OPC Formation / Statutory Compliance",
  "Partnership, Society, Foundation, Club & Trade Association",
  "IRC, ERC, BIDA Investment & Business Licences",
  "Intellectual Property (Trademark, Patent, Design, Copyright)",
  "Tax, VAT & Customs Appeals, Tribunal & High Court Writ",
  "Corporate Legal Advisory & Commercial Contracts",
  "Civil, Property & Criminal Litigation / Defence",
  "General Legal & Compliance Consultation",
] as const;

export const CONSULTATION_TYPES = [
  {
    value: "Chamber Visit" as const,
    labelEn: "In-Person Chamber Visit",
    labelBn: "চেম্বারে সরাসরি সাক্ষাৎ",
    subEn: "Ramna, Dhaka Chamber",
    subBn: "রমনা, ঢাকা চেম্বার",
  },
  {
    value: "Video Call" as const,
    labelEn: "Online Video Call",
    labelBn: "অনলাইন ভিডিও কল",
    subEn: "Across Bangladesh & Abroad",
    subBn: "সারা বাংলাদেশ ও প্রবাস থেকে",
  },
  {
    value: "Phone Call" as const,
    labelEn: "Direct Phone Consultation",
    labelBn: "ফোন কনসালটেশন",
    subEn: "Scheduled 30-Min Call",
    subBn: "নির্ধারিত ৩০ মিনিটের কল",
  },
] as const;

export const DEFAULT_TIME_SLOTS = [
  { slot_time: "15:00", slot_label: "3:00 PM" },
  { slot_time: "15:30", slot_label: "3:30 PM" },
  { slot_time: "16:00", slot_label: "4:00 PM" },
  { slot_time: "16:30", slot_label: "4:30 PM" },
  { slot_time: "17:00", slot_label: "5:00 PM" },
  { slot_time: "17:30", slot_label: "5:30 PM" },
  { slot_time: "18:00", slot_label: "6:00 PM" },
  { slot_time: "18:30", slot_label: "6:30 PM" },
  { slot_time: "19:00", slot_label: "7:00 PM" },
  { slot_time: "19:30", slot_label: "7:30 PM" },
] as const;

export interface ServiceCardItem {
  id: string;
  bookingCategory: (typeof SERVICE_CATEGORIES)[number];
  division: "tax" | "corporate" | "litigation";
  badgeEn: string;
  badgeBn: string;
  titleEn: string;
  titleBn: string;
  summaryEn: string;
  summaryBn: string;
  pointsEn: string[];
  pointsBn: string[];
  statute: string;
  accent: "navy" | "red" | "green" | "gold";
}

export const SERVICES_LIST: ServiceCardItem[] = [
  {
    id: "income-tax",
    bookingCategory: "Income Tax & Corporate Tax (e-TIN, Returns, TDS, Audit)",
    division: "tax",
    badgeEn: "Income Tax & Corporate Tax",
    badgeBn: "আয়কর ও কর্পোরেট ট্যাক্স",
    titleEn: "Individual & Corporate Income Tax",
    titleBn: "ব্যক্তিগত ও কর্পোরেট আয়কর সেবা",
    summaryEn:
      "End-to-end e-TIN registration, annual return preparation, PSR compliance, TDS reconciliation, corporate assessments, and audit defence.",
    summaryBn:
      "ই-টিআইএন নিবন্ধন, বার্ষিক রিটার্ন দাখিল, পিএসআর কমপ্লায়েন্স, টিডিএস সমন্বয়, কর্পোরেট অ্যাসেসমেন্ট ও অডিট সহায়তা।",
    pointsEn: [
      "Individual, firm & corporate tax returns (IT-10B & PSR)",
      "TDS withholding compliance & tax computation reconciliation",
      "Tax audit representation, notice responses & refund support",
    ],
    pointsBn: [
      "ব্যক্তি, ফার্ম ও কোম্পানির আয়কর রিটার্ন ও পিএসআর",
      "টিডিএস (TDS) কমপ্লায়েন্স ও আর্থিক বিবরণী সমন্বয়",
      "অডিট, নোটিশের জবাব ও ট্যাক্স অ্যাসেসমেন্ট সহায়তা",
    ],
    statute: "Income Tax Act, 2023 • Finance Act 2026",
    accent: "red",
  },
  {
    id: "vat-sd",
    bookingCategory: "VAT & Supplementary Duty (e-BIN, Mushak 9.1, VDS, Audit)",
    division: "tax",
    badgeEn: "VAT & Supplementary Duty",
    badgeBn: "ভ্যাট ও সম্পূরক শুল্ক",
    titleEn: "VAT Compliance, BIN & Mushak",
    titleBn: "ভ্যাট নিবন্ধন, মূসক ৯.১ ও ভিডিএস",
    summaryEn:
      "13-digit BIN registration, monthly Mushak 9.1 filing, input tax credit review, VDS (Mushak 6.6) tracking, and VAT audit responses.",
    summaryBn:
      "১৩-ডিজিট বিআইএন নিবন্ধন, মাসিক মূসক ৯.১ রিটার্ন, ইনপুট ট্যাক্স ক্রেডিট, ভিডিএস (মূসক ৬.৬) ও ভ্যাট অডিট সমাধান।",
    pointsEn: [
      "13-digit e-BIN registration, amendments & Mushak 6.1–6.5 registers",
      "Monthly Mushak 9.1 filing on or before the 15th & VDS compliance",
      "Input tax credit verification, VAT audit & show-cause replies",
    ],
    pointsBn: [
      "১৩-ডিজিট ই-বিআইএন নিবন্ধন ও মূসক ৬.১–৬.৫ রেজিস্টার",
      "প্রতি মাসের ১৫ তারিখের মধ্যে মূসক ৯.১ ও ভিডিএস দাখিল",
      "ইনপুট ট্যাক্স ক্রেডিট যাচাই ও ভ্যাট অডিট/শো-কজ জবাব",
    ],
    statute: "VAT & SD Act, 2012 • VAT Rules, 2016",
    accent: "green",
  },
  {
    id: "customs-trade",
    bookingCategory: "Customs & International Trade (HS Code, Valuation, Disputes)",
    division: "tax",
    badgeEn: "Customs & Trade",
    badgeBn: "কাস্টমস ও আমদানি-রপ্তানি",
    titleEn: "Customs Law & Cross-Border Trade",
    titleBn: "কাস্টমস আইন ও আন্তর্জাতিক বাণিজ্য",
    summaryEn:
      "HS code classification, customs valuation review, duty demand disputes, IRC/ERC support, and customs appellate proceedings.",
    summaryBn:
      "এইচএস কোড শ্রেণিবিন্যাস, কাস্টমস ভ্যালুয়েশন পর্যালোচনা, শুল্ক বিরোধ, আইআরসি/ইআরসি ও কাস্টমস আপিল সহায়তা।",
    pointsEn: [
      "HS code tariff classification & customs valuation analysis",
      "Show-cause notice replies, penalty & confiscation disputes",
      "Post-clearance compliance, Bills of Entry & trade documentation",
    ],
    pointsBn: [
      "এইচএস কোড শ্রেণিবিন্যাস ও কাস্টমস ভ্যালুয়েশন বিশ্লেষণ",
      "কাস্টমস শো-কজ নোটিশ, জরিমানা ও জব্দ সংক্রান্ত আইনি সহায়তা",
      "বিল অব এন্ট্রি ও আমদানি-রপ্তানি নথিপত্র যাচাই",
    ],
    statute: "Customs Act, 2023 • Import/Export Policy Orders",
    accent: "navy",
  },
  {
    id: "rjsc-company",
    bookingCategory: "RJSC Company & OPC Formation / Statutory Compliance",
    division: "corporate",
    badgeEn: "Corporate & RJSC",
    badgeBn: "কোম্পানি আইন ও আরজেএসসি",
    titleEn: "RJSC Company, OPC & Governance",
    titleBn: "আরজেএসসি কোম্পানি ও ওপিসি নিবন্ধন",
    summaryEn:
      "Private/Public Limited and One Person Company (OPC) formation, MOA/AOA drafting, Schedule X annual returns, Form XII, and share transfers.",
    summaryBn:
      "প্রাইভেট/পাবলিক লিমিটেড ও ওয়ান পারসন কোম্পানি (OPC) গঠন, MOA/AOA ড্রাফটিং, বার্ষিক রিটার্ন (Schedule X) ও শেয়ার ট্রান্সফার।",
    pointsEn: [
      "Name clearance, MOA/AOA drafting & RJSC incorporation",
      "Annual returns (Schedule X), Form XII & Form 117 share transfers",
      "AGM/EGM resolutions, audit coordination & corporate restructuring",
    ],
    pointsBn: [
      "নেম ক্লিয়ারেন্স, MOA/AOA প্রণয়ন ও আরজেএসসি ইনকর্পোরেশন",
      "Schedule X, Form XII পরিচালক পরিবর্তন ও Form 117 শেয়ার ট্রান্সফার",
      "AGM/EGM রেজল্যুশন, বার্ষিক কমপ্লায়েন্স ও কর্পোরেট পুনর্গঠন",
    ],
    statute: "Companies Act, 1994 • RJSC Rules",
    accent: "navy",
  },
  {
    id: "entities-licensing",
    bookingCategory: "IRC, ERC, BIDA Investment & Business Licences",
    division: "corporate",
    badgeEn: "Investment, Entities & Licences",
    badgeBn: "বিনিয়োগ, সংস্থা ও লাইসেন্স",
    titleEn: "IRC, ERC, BIDA, Partnerships & Permits",
    titleBn: "আইআরসি, ইআরসি, বিডা, পার্টনারশিপ ও লাইসেন্স",
    summaryEn:
      "Import/Export certificates, BIDA investment & work permits, partnership/society/trust/club/trade body formation, and trade licences.",
    summaryBn:
      "আমদানি-রপ্তানি সনদ (IRC/ERC), বিডা নিবন্ধন ও ওয়ার্ক পারমিট, পার্টনারশিপ/সোসাইটি/ট্রাস্ট/ক্লাব নিবন্ধন ও ট্রেড লাইসেন্স।",
    pointsEn: [
      "IRC, ERC, BIDA registration, branch office & expat work permits",
      "Partnership deeds, Societies, Foundations, Trusts, Clubs & Trade Bodies",
      "City Corporation Trade Licence, Fire Safety & DoE clearances",
    ],
    pointsBn: [
      "IRC, ERC, BIDA নিবন্ধন, ব্রাঞ্চ অফিস ও বিদেশি ওয়ার্ক পারমিট",
      "পার্টনারশিপ, সোসাইটি, ফাউন্ডেশন, ট্রাস্ট, ক্লাব ও ট্রেড অ্যাসোসিয়েশন",
      "ট্রেড লাইসেন্স, ফায়ার লাইসেন্স ও পরিবেশ ছাড়পত্র সহায়তা",
    ],
    statute: "BIDA Act, 2016 • Partnership Act, 1932 • Trade Org. Act, 2022",
    accent: "gold",
  },
  {
    id: "intellectual-property",
    bookingCategory: "Intellectual Property (Trademark, Patent, Design, Copyright)",
    division: "corporate",
    badgeEn: "Intellectual Property (DPDT)",
    badgeBn: "মেধাস্বত্ব ও ট্রেডমার্ক",
    titleEn: "Trademark, Patent, Design & Copyright",
    titleBn: "ট্রেডমার্ক, পেটেন্ট, ডিজাইন ও কপিরাইট",
    summaryEn:
      "Brand availability search, DPDT trademark filing (TM-1), objection & opposition handling, industrial design, patent, copyright & GI protection.",
    summaryBn:
      "ট্রেডমার্ক সার্চ, DPDT-তে আবেদন (TM-1), আপত্তি নিষ্পত্তি, ইন্ডাস্ট্রিয়াল ডিজাইন, পেটেন্ট, কপিরাইট ও জিআই সুরক্ষা।",
    pointsEn: [
      "Trademark search, Nice Classification & TM-1 filing at DPDT",
      "Examination objections, oppositions, renewals & brand enforcement",
      "Patent, Industrial Design, Copyright & GI registration support",
    ],
    pointsBn: [
      "ট্রেডমার্ক সার্চ, শ্রেণি নির্ধারণ ও DPDT-তে নিবন্ধন আবেদন",
      "পরীক্ষকের আপত্তি (Objection) জবাব, নবায়ন ও ব্র্যান্ড সুরক্ষা",
      "পেটেন্ট, ইন্ডাস্ট্রিয়াল ডিজাইন, কপিরাইট ও জিআই সহায়তা",
    ],
    statute: "Trademarks Act, 2009 • Patent & Design Acts, 2023",
    accent: "green",
  },
  {
    id: "appeals-tribunals-writs",
    bookingCategory: "Tax, VAT & Customs Appeals, Tribunal & High Court Writ",
    division: "litigation",
    badgeEn: "Revenue Litigation & High Court",
    badgeBn: "আপিল, ট্রাইব্যুনাল ও হাইকোর্ট রিট",
    titleEn: "Tax/VAT Appeals, Tribunals & Writ Petitions",
    titleBn: "ট্যাক্স/ভ্যাট আপিল, ট্রাইব্যুনাল ও রিট পিটিশন",
    summaryEn:
      "Statutory appeals before Commissioners, Taxes Appellate Tribunal & CEVAT, plus High Court Tax References and Article 102 Writ Petitions.",
    summaryBn:
      "কমিশনার (আপিল), ট্যাক্স ও ভ্যাট আপিলাত ট্রাইব্যুনাল (CEVAT), হাইকোর্ট রেফারেন্স এবং সংবিধানের ১০২ অনুচ্ছেদে রিট পিটিশন।",
    pointsEn: [
      "Commissioner (Appeals), Taxes Appellate Tribunal & CEVAT hearings",
      "Constitutional Writ Petitions challenging unlawful demands or frozen accounts",
      "Limitation tracking, stay petitions & High Court Company Matters",
    ],
    pointsBn: [
      "কমিশনার (আপিল), ট্যাক্সেস আপিলাত ট্রাইব্যুনাল ও CEVAT শুনানি",
      "অবৈধ কর দাবি বা ব্যাংক অ্যাকাউন্ট ফ্রিজের বিরুদ্ধে হাইকোর্টে রিট পিটিশন",
      "তামাদি (Limitation) যাচাই, স্টে পিটিশন ও কোম্পানি ম্যাটারস",
    ],
    statute: "Constitution Art. 102 • Appellate Tribunal Rules",
    accent: "red",
  },
  {
    id: "corporate-civil-criminal",
    bookingCategory: "Civil, Property & Criminal Litigation / Defence",
    division: "litigation",
    badgeEn: "Advisory & Court Representation",
    badgeBn: "কর্পোরেট, দেওয়ানি ও ফৌজদারি আইন",
    titleEn: "Corporate Legal, Civil & Criminal Matters",
    titleBn: "কর্পোরেট চুক্তি, দেওয়ানি ও ফৌজদারি মামলা",
    summaryEn:
      "Commercial contract drafting, labour compliance, property & money recovery suits, cheque dishonour (NI Act), bail, and criminal defence.",
    summaryBn:
      "বাণিজ্যিক চুক্তি প্রণয়ন, শ্রম আইন কমপ্লায়েন্স, জমি/অর্থ আদায়ের দেওয়ানি মামলা, চেক ডিজঅনার (NI Act) ও ফৌজদারি প্রতিরক্ষা।",
    pointsEn: [
      "Shareholders, JV, vendor, lease & employment agreements",
      "Civil suits, injunctions, property title & commercial recovery",
      "Criminal defence, bail applications & NI Act cheque dishonour matters",
    ],
    pointsBn: [
      "শেয়ারহোল্ডার, জয়েন্ট ভেঞ্চার, লিজ ও কর্মসংস্থান চুক্তি প্রণয়ন",
      "দেওয়ানি মামলা, নিষেধাজ্ঞা, জমি-মালিকানা ও অর্থ আদায়",
      "ফৌজদারি প্রতিরক্ষা, জামিন আবেদন ও চেক ডিজঅনার মামলা",
    ],
    statute: "CPC 1908 • CrPC 1898 • NI Act 1881 • Labour Act 2006",
    accent: "navy",
  },
];

export const WHY_CHOOSE_ITEMS = [
  {
    num: "01",
    titleEn: "Integrated Legal, Tax & Compliance Desk",
    titleBn: "একই ছাতার নিচে সমন্বিত আইন ও কর সেবা",
    descEn:
      "Company incorporation, trade licences, income tax, VAT, customs, IP and court remedies coordinated seamlessly under one legal practice.",
    descBn:
      "কোম্পানি নিবন্ধন, ট্রেড লাইসেন্স, আয়কর, ভ্যাট, কাস্টমস, মেধাস্বত্ব ও আদালত কার্যক্রম একই চেম্বার থেকে সমন্বিতভাবে পরিচালনা।",
  },
  {
    num: "02",
    titleEn: "Verified Statutory & Evidence-Based Counsel",
    titleBn: "হালনাগাদ আইন ও প্রমাণভিত্তিক আইনি পরামর্শ",
    descEn:
      "Clear, realistic guidance verified against the Income Tax Act 2023, VAT & SD Act 2012, Customs Act 2023, Finance Act 2026 and current SROs.",
    descBn:
      "আয়কর আইন ২০২৩, ভ্যাট আইন ২০১২, কাস্টমস আইন ২০২৩, অর্থ আইন ২০২৬ ও সর্বশেষ এসআরও যাচাই করে বাস্তবসম্মত পরামর্শ।",
  },
  {
    num: "03",
    titleEn: "Strict Deadline & Limitation Control",
    titleBn: "নির্ধারিত সময়সীমা ও তামাদি নিয়ন্ত্রণ",
    descEn:
      "Disciplined tracking of monthly Mushak 9.1 filings, annual returns, notice response windows, and statutory appeal limitation dates.",
    descBn:
      "মাসিক মূসক ৯.১, বার্ষিক রিটার্ন, নোটিশের জবাব ও আপিলের নির্ধারিত তামাদি সময়সীমা কঠোরভাবে অনুসরণ।",
  },
  {
    num: "04",
    titleEn: "Confidentiality & Transparent Scope",
    titleBn: "গোপনীয়তা ও স্বচ্ছ কর্মপরিধি",
    descEn:
      "Plain-language explanation of applicable legal routes, required documents, risks and agreed scope—with strict professional confidentiality.",
    descBn:
      "আইনি প্রক্রিয়া, প্রয়োজনীয় নথিপত্র, ঝুঁকি এবং সেবার পরিধি সহজ ভাষায় ব্যাখ্যা ও ক্লায়েন্টের তথ্যের পূর্ণ গোপনীয়তা রক্ষা।",
  },
] as const;

export const WHO_WE_HELP = [
  {
    titleEn: "Business Owners & Proprietors",
    titleBn: "ব্যবসায়ী ও স্বত্বাধিকারী",
    descEn: "e-TIN, BIN, trade licences, monthly VAT returns & business legal protection.",
    descBn: "ই-টিআইএন, বিআইএন, ট্রেড লাইসেন্স, মাসিক ভ্যাট রিটার্ন ও আইনি সুরক্ষা।",
  },
  {
    titleEn: "Company Directors & Corporates",
    titleBn: "কোম্পানি পরিচালক ও কর্পোরেট",
    descEn: "RJSC filings, Schedule X, Form XII, corporate taxation, audits & board governance.",
    descBn: "আরজেএসসি ফাইলিং, Schedule X, কর্পোরেট ট্যাক্স, অডিট ও বোর্ড গভর্ন্যান্স।",
  },
  {
    titleEn: "Importers & Exporters",
    titleBn: "আমদানিকারক ও রপ্তানিকারক",
    descEn: "IRC/ERC registration, HS code & customs valuation disputes, and CEVAT appeals.",
    descBn: "আইআরসি/ইআরসি, এইচএস কোড, কাস্টমস ভ্যালুয়েশন বিরোধ ও ট্রাইব্যুনাল আপিল।",
  },
  {
    titleEn: "VAT-Registered Businesses",
    titleBn: "ভ্যাট নিবন্ধিত প্রতিষ্ঠান",
    descEn: "Mushak 9.1 filing, input tax credit reconciliation, VDS & VAT audit defence.",
    descBn: "মূসক ৯.১ দাখিল, ইনপুট ট্যাক্স ক্রেডিট, ভিডিএস ও ভ্যাট অডিট সহায়তা।",
  },
  {
    titleEn: "Entrepreneurs & Startups",
    titleBn: "উদ্যোক্তা ও স্টার্টআপ",
    descEn: "Pvt Ltd / OPC incorporation, founder agreements, trademark protection & licensing.",
    descBn: "প্রাইভেট লিমিটেড/ওপিসি গঠন, ফাউন্ডার চুক্তি ও ট্রেডমার্ক নিবন্ধন।",
  },
  {
    titleEn: "Individual Taxpayers & Professionals",
    titleBn: "ব্যক্তিগত করদাতা ও পেশাজীবী",
    descEn: "Accurate income tax returns, wealth statements (IT-10B), PSR & tax planning.",
    descBn: "নির্ভুল আয়কর রিটার্ন, সম্পদ বিবরণী (IT-10B), পিএসআর ও কর পরিকল্পনা।",
  },
  {
    titleEn: "Foreign Investors & NGOs / Associations",
    titleBn: "বিদেশি বিনিয়োগকারী ও এনজিও/সংগঠন",
    descEn: "BIDA approvals, work permits, society, foundation, trust, club & trade body compliance.",
    descBn: "বিডা অনুমোদন, ওয়ার্ক পারমিট, সোসাইটি, ফাউন্ডেশন, ট্রাস্ট ও ট্রেড বডি।",
  },
  {
    titleEn: "Dispute & Litigation Clients",
    titleBn: "আদালত ও আইনি বিরোধের ক্লায়েন্ট",
    descEn: "Tax/VAT notices, High Court writ petitions, civil/property suits & criminal defence.",
    descBn: "ট্যাক্স/ভ্যাট নোটিশ, হাইকোর্ট রিট, দেওয়ানি/জমি মামলা ও ফৌজদারি প্রতিরক্ষা।",
  },
] as const;

export const PROCESS_STEPS = [
  {
    step: "01",
    titleEn: "Initial Consultation",
    titleBn: "প্রাথমিক পরামর্শ",
    descEn: "Book a Chamber Visit, Video or Phone slot to outline your matter and objectives.",
    descBn: "চেম্বার, ভিডিও বা ফোন স্লট বুক করে আপনার আইনি বা কর বিষয়টি বিস্তারিত জানান।",
  },
  {
    step: "02",
    titleEn: "Document Review",
    titleBn: "নথিপত্র পর্যালোচনা",
    descEn: "We carefully examine your notices, returns, corporate records or agreements.",
    descBn: "আপনার নোটিশ, রিটার্ন, কোম্পানির কাগজপত্র বা চুক্তিপত্র সতর্কতার সাথে যাচাই করা হয়।",
  },
  {
    step: "03",
    titleEn: "Legal Assessment",
    titleBn: "আইনি মূল্যায়ন",
    descEn: "We identify applicable statutes, limitation deadlines, risks and lawful options.",
    descBn: "প্রযোজ্য আইন, সময়সীমা, ঝুঁকি এবং বৈধ আইনি সমাধানগুলো নির্ধারণ করা হয়।",
  },
  {
    step: "04",
    titleEn: "Engagement & Action Plan",
    titleBn: "কর্মপরিকল্পনা ও সম্মতি",
    descEn: "Clear written scope, deliverables, timeline and responsibilities before work begins.",
    descBn: "কাজ শুরুর আগেই সুস্পষ্ট কর্মপরিধি, সময়সূচি ও দায়িত্ব নির্ধারণ করা হয়।",
  },
  {
    step: "05",
    titleEn: "Preparation & Filing",
    titleBn: "প্রস্তুতি ও দাখিল",
    descEn: "Drafting filings, returns or pleadings, obtaining client sign-off and submitting properly.",
    descBn: "রিটার্ন, আবেদন বা আরজি প্রস্তুত, ক্লায়েন্টের অনুমোদন এবং সঠিক কর্তৃপক্ষের কাছে দাখিল।",
  },
  {
    step: "06",
    titleEn: "Follow-up & Closure",
    titleBn: "ফলো-আপ ও সম্পন্নকরণ",
    descEn: "Preserving official receipts, reporting outcomes and diarising future compliance dates.",
    descBn: "অফিশিয়াল রসিদ সংরক্ষণ, ফলাফল জানানো এবং পরবর্তী কমপ্লায়েন্স তারিখ নথিভুক্ত করা।",
  },
] as const;

export const FAQ_ITEMS = [
  {
    qEn: "Is my appointment immediately confirmed when I submit the form?",
    qBn: "ফর্ম জমা দেওয়ার সাথে সাথেই কি অ্যাপয়েন্টমেন্ট নিশ্চিত হয়ে যায়?",
    aEn: "No. Every request receives a unique Inquiry ID with status 'Pending Review'. Our Ramna chamber desk reviews your request and confirms your exact consultation slot via phone or WhatsApp.",
    aBn: "না। প্রতিটি আবেদনের জন্য একটি ইউনিক ইনকোয়ারি আইডি দেওয়া হয় এবং স্ট্যাটাস 'অপেক্ষমাণ (Pending)' থাকে। আমাদের রমনা চেম্বার ডেস্ক যাচাই করে ফোন বা হোয়াটসঅ্যাপের মাধ্যমে সময় নিশ্চিত করে।",
  },
  {
    qEn: "Do you serve clients outside Dhaka or living abroad?",
    qBn: "আপনারা কি ঢাকার বাইরে বা প্রবাসী বাংলাদেশিদের সেবা দেন?",
    aEn: "Yes. We assist clients across all districts of Bangladesh as well as NRBs and foreign investors via scheduled Video Call or Phone consultations, alongside in-person appointments at our Ramna, Dhaka chamber.",
    aBn: "হ্যাঁ। রমনা, ঢাকা চেম্বারে সরাসরি সাক্ষাতের পাশাপাশি ভিডিও কল ও ফোনের মাধ্যমে সারা বাংলাদেশ ও প্রবাসী ক্লায়েন্টদের সেবা প্রদান করা হয়।",
  },
  {
    qEn: "Can you handle urgent NBR Income Tax, VAT or Customs notices?",
    qBn: "জরুরি আয়কর, ভ্যাট বা কাস্টমস নোটিশের বিষয়ে কি সহায়তা করেন?",
    aEn: "Yes. We review the impugned notice or assessment order, service date, statutory section and limitation deadline, then prepare structured replies, statutory appeals, tribunal briefs or High Court remedies where maintainable.",
    aBn: "হ্যাঁ। নোটিশ বা অ্যাসেসমেন্ট অর্ডার, তামাদি সময়সীমা ও প্রযোজ্য ধারা যাচাই করে লিখিত জবাব, আপিল, ট্রাইব্যুনাল বা হাইকোর্টে আইনি প্রতিকারের ব্যবস্থা করা হয়।",
  },
  {
    qEn: "Can TaxVat LawAid register a new company and manage ongoing compliance?",
    qBn: "নতুন কোম্পানি নিবন্ধন ও বাৎসরিক কমপ্লায়েন্স কি আপনারা পরিচালনা করেন?",
    aEn: "Yes. We handle RJSC name clearance, MOA/AOA drafting, Private Limited or OPC incorporation, e-TIN, 13-digit e-BIN, trade licence, IRC/ERC, plus ongoing monthly VAT and annual RJSC/tax filings.",
    aBn: "হ্যাঁ। আরজেএসসি নেম ক্লিয়ারেন্স, MOA/AOA, প্রাইভেট লিমিটেড বা ওপিসি নিবন্ধন, ই-টিআইএন, ই-বিআইএন, ট্রেড লাইসেন্স ও বাৎসরিক কমপ্লায়েন্স সেবা প্রদান করা হয়।",
  },
] as const;

export const FOUNDATIONAL_VALUES = [
  { en: "Integrity", bn: "সততা" },
  { en: "Professional Competence", bn: "পেশাগত দক্ষতা" },
  { en: "Confidentiality", bn: "গোপনীয়তা" },
  { en: "Transparency", bn: "স্বচ্ছতা" },
  { en: "Accountability", bn: "জবাবদিহিতা" },
  { en: "Rule of Law", bn: "আইনের শাসন" },
] as const;
