"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileCheck2,
  Globe,
  Gavel,
  Landmark,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  Scale,
  Shield,
  Users,
  X,
} from "lucide-react";
import {
  FAQ_ITEMS,
  FIRM_INFO,
  FOUNDATIONAL_VALUES,
  PROCESS_STEPS,
  SERVICES_LIST,
  WHO_WE_HELP,
  WHY_CHOOSE_ITEMS,
  type Locale,
} from "@/data/firm";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";
import { BrandLogo } from "@/components/BrandLogo";
import { AppointmentBookingSection } from "@/components/AppointmentBookingSection";

export function LandingPageClient() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<
    "all" | "tax" | "corporate" | "litigation"
  >("all");
  const [selectedBookingService, setSelectedBookingService] = useState<
    string | undefined
  >(undefined);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isBn = locale === "bn";

  const visibleServices =
    serviceFilter === "all"
      ? SERVICES_LIST
      : SERVICES_LIST.filter((s) => s.division === serviceFilter);

  function handleSelectServiceForBooking(bookingCategory: string) {
    setSelectedBookingService(bookingCategory);
    const el = document.getElementById("appointment");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      className={`min-h-screen bg-white text-[#1E2438] pb-16 md:pb-0 ${
        isBn ? "font-bn-mode" : ""
      }`}
    >
      {/* =====================================================================
          SECTION 1: TOP CHAMBER BAR + STICKY HEADER WITH OFFICIAL LOGO & CTA
      ====================================================================== */}
      <div className="bg-[#1B1E59] text-slate-200 text-xs border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#E0B437]" />
              <span className="hidden sm:inline">
                {isBn
                  ? "রমনা, ঢাকা চেম্বার (ইস্টার্ন ম্যানশন, লিফট-১৪)"
                  : "Ramna, Dhaka Chamber (Eastern Mansion, Lift-14)"}
              </span>
              <span className="sm:hidden">Ramna, Dhaka</span>
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#A8CC3C]" />
              {isBn ? FIRM_INFO.hours.bn : FIRM_INFO.hours.en}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${FIRM_INFO.phones[0].tel}`}
              onClick={() => trackPhoneClick(FIRM_INFO.phones[0].display, "top_bar")}
              className="inline-flex items-center gap-1.5 hover:text-white transition font-medium"
            >
              <Phone className="h-3.5 w-3.5 text-[#E0B437]" />
              <span>01614-446444</span>
            </a>
            <span className="hidden sm:inline text-white/30">|</span>
            <a
              href={FIRM_INFO.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("top_bar")}
              className="hidden sm:inline-flex items-center gap-1.5 text-[#A8CC3C] hover:text-white transition font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a href="#top" aria-label="TaxVat LawAid Home">
            <BrandLogo />
          </a>

          {/* Single-page anchor links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700"
          >
            <a href="#about" className="hover:text-[#2B2E7E] transition">
              {isBn ? "পরিচিতি" : "About"}
            </a>
            <a href="#services" className="hover:text-[#2B2E7E] transition">
              {isBn ? "সেবাসমূহ" : "Services"}
            </a>
            <a href="#lead-counsel" className="hover:text-[#2B2E7E] transition">
              {isBn ? "প্রধান আইনজীবী" : "Lead Counsel"}
            </a>
            <a href="#who-we-help" className="hover:text-[#2B2E7E] transition">
              {isBn ? "ক্লায়েন্ট" : "Who We Help"}
            </a>
            <a href="#process" className="hover:text-[#2B2E7E] transition">
              {isBn ? "কার্যপ্রণালী" : "Process"}
            </a>
            <a href="#contact" className="hover:text-[#2B2E7E] transition">
              {isBn ? "যোগাযোগ" : "Contact"}
            </a>
          </nav>

          {/* Language Toggle + Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setLocale(isBn ? "en" : "bn")}
              aria-label="Switch Language"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-[#1B1E59] transition cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#2B2E7E]" />
              <span>{isBn ? "EN" : "বাংলা"}</span>
            </button>

            <a
              href="#appointment"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#CC242B] hover:bg-[#A81B21] px-4 lg:px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#CC242B]/20 transition"
            >
              <Calendar className="h-4 w-4" />
              <span>{isBn ? "অ্যাপয়েন্টমেন্ট নিন" : "Book Appointment"}</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-[#1B1E59] hover:bg-slate-50 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen ? (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
            {[
              { href: "#about", en: "About TaxVat LawAid", bn: "পরিচিতি" },
              { href: "#services", en: "Legal & Tax Services", bn: "আইন ও কর সেবাসমূহ" },
              { href: "#lead-counsel", en: "Lead Counsel Profile", bn: "প্রধান আইনজীবী" },
              { href: "#who-we-help", en: "Who We Help", bn: "যাদের সেবা দিই" },
              { href: "#process", en: "Consultation Process", bn: "পরামর্শ প্রক্রিয়া" },
              { href: "#contact", en: "Chamber & Contact", bn: "চেম্বার ও যোগাযোগ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#EEF0FA] hover:text-[#2B2E7E]"
              >
                {isBn ? item.bn : item.en}
              </a>
            ))}
            <a
              href="#appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#CC242B] px-4 py-3 text-sm font-semibold text-white"
            >
              <Calendar className="h-4 w-4" />
              {isBn ? "অ্যাপয়েন্টমেন্ট বুক করুন" : "Book Appointment Now"}
            </a>
          </div>
        ) : null}
      </header>

      <main id="top">
        {/* ===================================================================
            SECTION 2: HERO SECTION — HIGH-CONVERSION CORPORATE LEGAL HERO
        ==================================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F6F7FC] via-white to-white bg-legal-grid pt-10 pb-16 lg:pt-16 lg:pb-24">
          {/* Subtle Brand Color Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2B2E7E] via-[#CC242B] via-60% to-[#45B049]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy Column */}
              <div className="lg:col-span-7 animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2B2E7E] shadow-xs ring-1 ring-[#2B2E7E]/15">
                  <Scale className="h-3.5 w-3.5 text-[#C99A1E]" />
                  <span>
                    {isBn
                      ? "বাংলাদেশে সমন্বিত আইন, আয়কর, ভ্যাট, কাস্টমস ও কর্পোরেট চেম্বার"
                      : "Integrated Tax, VAT, Customs & Corporate Legal Practice • Bangladesh"}
                  </span>
                </div>

                <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#1B1E59] leading-[1.12]">
                  {isBn ? (
                    <>
                      আয়কর, ভ্যাট, কাস্টমস ও কর্পোরেট আইনে{" "}
                      <span className="text-[#CC242B]">বিশ্বস্ত</span> আইনি পরামর্শ ও সুরক্ষা
                    </>
                  ) : (
                    <>
                      Strategic{" "}
                      <span className="text-[#CC242B]">Tax</span>,{" "}
                      <span className="text-[#45B049]">VAT</span> &amp; Corporate
                      Legal Counsel in Bangladesh
                    </>
                  )}
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {isBn
                    ? "ব্যক্তিগত ও কর্পোরেট আয়কর, মূসক ৯.১ ভ্যাট কমপ্লায়েন্স, কাস্টমস বিরোধ, আরজেএসসি কোম্পানি নিবন্ধন, ট্রেডমার্ক, আপিলাত ট্রাইব্যুনাল ও হাইকোর্ট রিট পিটিশনে স্পষ্ট, প্রমাণভিত্তিক ও পেশাদার আইনি সমাধান।"
                    : "Clear, evidence-based representation for businesses, directors, importers, and individual taxpayers across Income Tax, VAT & Mushak, Customs, RJSC Company Law, Intellectual Property, Tribunals, and High Court Writs."}
                </p>

                {/* Primary & Secondary Conversion CTAs */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                  <a
                    href="#appointment"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#CC242B] hover:bg-[#A81B21] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#CC242B]/20 transition"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>
                      {isBn ? "অ্যাপয়েন্টমেন্ট বুক করুন" : "Book a Consultation"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <a
                    href={FIRM_INFO.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick("hero_cta")}
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#45B049] hover:bg-[#359639] px-6 py-4 text-base font-semibold text-white shadow-md shadow-[#45B049]/15 transition"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>
                      {isBn ? "হোয়াটসঅ্যাপে কথা বলুন" : "WhatsApp Chamber Desk"}
                    </span>
                  </a>
                </div>

                {/* Verified Chamber Trust Row */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-200/80">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#45B049] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1B1E59]">
                        {isBn ? "রমনা, ঢাকা চেম্বার" : "Ramna, Dhaka Chamber"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? "সরাসরি সাক্ষাৎ ও অনলাইন পরামর্শ"
                          : "In-person, Video & Phone"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2B2E7E] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1B1E59]">
                        {isBn ? "অভিজ্ঞ অ্যাডভোকেট ও কর উপদেষ্টা" : "Advocate & Tax Consultant"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {FIRM_INFO.leadCounsel.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C99A1E] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1B1E59]">
                        {isBn ? "সারা বাংলাদেশে সেবা" : "Nationwide Bangladesh Support"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isBn
                          ? "রবি–বৃহঃ • বিকাল ৩টা – রাত ৮টা"
                          : "Sun–Thu • 3:00 PM – 8:00 PM BST"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Visual & Executive Credentials Card */}
              <div className="lg:col-span-5 animate-fade-up-delay">
                <div className="relative rounded-2xl bg-white p-3 shadow-xl shadow-[#1B1E59]/10 ring-1 ring-slate-200/90">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src="/images/hero-legal-chamber.jpg"
                      alt="TaxVat LawAid Legal & Tax Consultancy Chamber in Dhaka"
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12143D]/85 via-[#12143D]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-[#E0B437] border border-white/15">
                        {isBn ? "প্রধান আইনজীবী ও স্বত্বাধিকারী" : "Lead Counsel & Proprietor"}
                      </span>
                      <p className="mt-1.5 font-serif text-xl font-bold leading-snug">
                        {isBn
                          ? FIRM_INFO.leadCounsel.nameBn
                          : FIRM_INFO.leadCounsel.name}
                      </p>
                      <p className="text-xs text-slate-200">
                        {FIRM_INFO.leadCounsel.credentials} •{" "}
                        {FIRM_INFO.leadCounsel.title}
                      </p>
                    </div>
                  </div>

                  {/* Compact Direct Action Strip inside Hero Card */}
                  <div className="mt-3 rounded-xl bg-[#F6F7FC] p-4 border border-slate-200/80">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2B2E7E]">
                      {isBn ? "প্রধান অনুশীলন ক্ষেত্র" : "Core Legal Mandates"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-700 leading-relaxed">
                      {isBn
                        ? FIRM_INFO.leadCounsel.specialisationLineBn
                        : FIRM_INFO.leadCounsel.specialisationLine}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <a
                        href={`tel:${FIRM_INFO.phones[0].tel}`}
                        onClick={() =>
                          trackPhoneClick(FIRM_INFO.phones[0].display, "hero_card")
                        }
                        className="inline-flex items-center gap-1.5 font-bold text-[#1B1E59] hover:text-[#CC242B] transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#CC242B]" />
                        01614-446444
                      </a>
                      <a
                        href="#appointment"
                        className="inline-flex items-center gap-1 font-semibold text-[#2B2E7E] hover:underline"
                      >
                        {isBn ? "স্লট দেখুন" : "Check Open Slots"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 3: SHORT INTRODUCTION TO TAXVAT LAWAID
        ==================================================================== */}
        <section id="about" className="py-16 lg:py-22 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#CC242B]">
                  {isBn ? "আমাদের সম্পর্কে" : "About TaxVat LawAid"}
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1B1E59] leading-tight">
                  {isBn
                    ? "ব্যবসার প্রতিটি ধাপে আপনার সমন্বিত আইনি ও কর অংশীদার"
                    : "A Complete Legal Partner for Every Stage of Business"}
                </h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  {isBn
                    ? "TaxVat LawAid (সহযোগী অনুশীলন: TaxAid) বাংলাদেশের ব্যক্তি, উদ্যোক্তা, স্টার্টআপ, এসএমই, প্রতিষ্ঠিত কোম্পানি এবং বিনিয়োগকারীদের জন্য সমন্বিত আইনি, আয়কর, ভ্যাট, কাস্টমস, আরজেএসসি কোম্পানি আইন, মেধাস্বত্ব ও আদালত সহায়তা প্রদান করে।"
                    : "TaxVat LawAid (Associated Practice: TaxAid) is a Bangladesh-focused legal and corporate consultancy practice bringing together taxation, VAT, customs, company registration, intellectual property, regulatory compliance, and litigation support under one roof."}
                </p>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  {isBn
                    ? "আইনি ও রেগুলেটরি দায়িত্বসমূহ একে অপরের সাথে যুক্ত—কোম্পানি নিবন্ধন, ট্রেড লাইসেন্স, টিআইএন, বিআইএন, আমদানি-রপ্তানি অনুমোদন, বার্ষিক ফাইলিং ও বিরোধ নিষ্পত্তি। আমাদের সমন্বিত কর্মপদ্ধতি আপনাকে সকল বাধ্যবাধকতা সুশৃঙ্খলভাবে পরিচালনা করতে সহায়তা করে।"
                    : "We recognise that legal and regulatory matters are interconnected. From incorporation, trade licensing, TIN/BIN registration, and annual statutory filings to defending NBR notices or representing clients before Tribunals and the High Court, our commitment is clear advice, careful preparation, and dependable representation."}
                </p>
              </div>

              {/* Right: Foundational Values & Mission Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#F6F7FC] p-6 sm:p-8 border border-slate-200/80">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#2B2E7E]">
                        {isBn ? "আমাদের মূলনীতি" : "Foundational Practice Principles"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {isBn
                          ? "পেশাগত নৈতিকতা ও আইনের শাসনের প্রতি অঙ্গীকারবদ্ধ"
                          : "Built on professional integrity, clarity, and strict confidentiality"}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-[#C99A1E] shrink-0" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FOUNDATIONAL_VALUES.map((val, idx) => (
                      <div
                        key={val.en}
                        className="rounded-xl bg-white p-3.5 shadow-2xs ring-1 ring-slate-200/80"
                      >
                        <span className="text-[11px] font-mono font-bold text-[#C99A1E]">
                          0{idx + 1}
                        </span>
                        <p className="mt-1 text-sm font-semibold text-[#1B1E59]">
                          {isBn ? val.bn : val.en}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-xs text-slate-500 leading-relaxed">
                    {isBn
                      ? "লক্ষ্য: বাংলাদেশের জটিল আইনি ও রেগুলেটরি বিধানগুলো সহজবোধ্য করা এবং সঠিক নথিপত্র ও বৈধ আইনি প্রতিকারের মাধ্যমে ক্লায়েন্টের স্বার্থ সুরক্ষিত রাখা।"
                      : "Our Vision: To be a trusted and respected legal and corporate compliance partner in Bangladesh, known for professional integrity, practical legal solutions, and client-focused service."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: PROFESSIONAL LEGAL & TAX SERVICES
        ==================================================================== */}
        <section
          id="services"
          className="py-20 lg:py-24 bg-[#F6F7FC] border-t border-slate-200/70"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#2B2E7E]">
                  {isBn ? "আমাদের আইনি ও কর সেবাসমূহ" : "Core Legal & Tax Services"}
                </span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1B1E59]">
                  {isBn
                    ? "আয়কর, ভ্যাট, কাস্টমস, কোম্পানি আইন ও মামলা পরিচালনা"
                    : "Comprehensive Legal, Tax & Regulatory Solutions"}
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  {isBn
                    ? "বাংলাদেশের প্রচলিত আইন ও বিধিমালা অনুযায়ী আমাদের ৮টি মূল বিভাগের আওতায় ২০+ বিশেষায়িত সেবা।"
                    : "Structured advisory, statutory filings, and courtroom representation across Bangladesh revenue, corporate, licensing, IP, and litigation frameworks."}
                </p>
              </div>

              {/* Clean Division Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", en: "All Services", bn: "সকল সেবা" },
                  { key: "tax", en: "Tax, VAT & Customs", bn: "ট্যাক্স, ভ্যাট ও কাস্টমস" },
                  { key: "corporate", en: "Corporate, BIDA & IP", bn: "কোম্পানি ও মেধাস্বত্ব" },
                  { key: "litigation", en: "Appeals, Writs & Courts", bn: "আপিল, রিট ও আদালত" },
                ].map((tab) => {
                  const active = serviceFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() =>
                        setServiceFilter(
                          tab.key as "all" | "tax" | "corporate" | "litigation"
                        )
                      }
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "bg-[#2B2E7E] text-white shadow-xs"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#2B2E7E]/40"
                      }`}
                    >
                      {isBn ? tab.bn : tab.en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {visibleServices.map((service) => {
                const topBorderColor =
                  service.accent === "red"
                    ? "border-t-[#CC242B]"
                    : service.accent === "green"
                      ? "border-t-[#45B049]"
                      : service.accent === "gold"
                        ? "border-t-[#C99A1E]"
                        : "border-t-[#2B2E7E]";
                const badgeClass =
                  service.accent === "red"
                    ? "bg-[#FDF1F2] text-[#CC242B]"
                    : service.accent === "green"
                      ? "bg-[#EEF9EF] text-[#247A28]"
                      : service.accent === "gold"
                        ? "bg-[#FBF6E6] text-[#9A720F]"
                        : "bg-[#EEF0FA] text-[#2B2E7E]";

                return (
                  <article
                    key={service.id}
                    className={`group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-xs ring-1 ring-slate-200/90 border-t-4 ${topBorderColor} hover:shadow-md transition-all duration-200`}
                  >
                    <div>
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${badgeClass}`}
                      >
                        {isBn ? service.badgeBn : service.badgeEn}
                      </span>

                      <h3 className="mt-3 font-serif text-xl font-bold text-[#1B1E59] leading-snug">
                        {isBn ? service.titleBn : service.titleEn}
                      </h3>

                      <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                        {isBn ? service.summaryBn : service.summaryEn}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-700">
                        {(isBn ? service.pointsBn : service.pointsEn).map((pt) => (
                          <li key={pt} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#45B049] mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">
                        {service.statute}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectServiceForBooking(service.bookingCategory)
                        }
                        className="mt-3 w-full inline-flex items-center justify-between rounded-xl bg-[#F6F7FC] group-hover:bg-[#2B2E7E] px-3.5 py-2.5 text-xs font-semibold text-[#1B1E59] group-hover:text-white transition cursor-pointer"
                      >
                        <span>
                          {isBn
                            ? "এই সেবার জন্য পরামর্শ নিন"
                            : "Consult on This Service"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 5: WHY CHOOSE TAXVAT LAWAID
        ==================================================================== */}
        <section className="py-20 bg-[#1B1E59] text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E0B437]">
                <Award className="h-4 w-4" />
                {isBn ? "কেন TaxVat LawAid বেছে নেবেন" : "Why Choose TaxVat LawAid"}
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-white">
                {isBn
                  ? "আইনি শৃঙ্খলা, স্বচ্ছ নথিপত্র ও সময়নিষ্ঠ কমপ্লায়েন্স"
                  : "Precision Legal Counsel Backed by Procedural Discipline"}
              </h2>
              <p className="mt-3 text-base text-slate-300 leading-relaxed">
                {isBn
                  ? "আমরা অবাস্তব প্রতিশ্রুতি দিই না—প্রতিটি ফাইল, নোটিশ ও মামলায় প্রযোজ্য আইন, প্রমাণ এবং সময়সীমা যাচাই করে বাস্তবসম্মত আইনি পদক্ষেপ গ্রহণ করি।"
                  : "Corporate entities, importers, and individual taxpayers rely on methodical statutory preparation, accurate documentation, and disciplined limitation tracking across regulatory forums."}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_CHOOSE_ITEMS.map((item) => (
                <div
                  key={item.num}
                  className="rounded-2xl bg-white/[0.06] border border-white/12 p-6 backdrop-blur-xs hover:bg-white/[0.09] transition"
                >
                  <span className="font-mono text-sm font-bold text-[#E0B437]">
                    {item.num}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-white leading-snug">
                    {isBn ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                    {isBn ? item.descBn : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 6: LEAD COUNSEL PROFILE (VERIFIED DETAILS)
        ==================================================================== */}
        <section id="lead-counsel" className="py-20 lg:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#F6F7FC] border border-slate-200/90 overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left Executive Chamber Visual + Verified Monogram Emblem */}
                <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[460px] bg-[#1B1E59]">
                  <Image
                    src="/images/chamber-consultation-room.jpg"
                    alt="TaxVat LawAid Executive Consultation Chamber in Ramna, Dhaka"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12143D]/95 via-[#12143D]/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#E0B437] border border-white/20">
                      <Gavel className="h-3.5 w-3.5" />
                      {isBn
                        ? FIRM_INFO.leadCounsel.roleBn
                        : FIRM_INFO.leadCounsel.role}
                    </div>
                    <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold">
                      {isBn
                        ? FIRM_INFO.leadCounsel.nameBn
                        : FIRM_INFO.leadCounsel.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-200">
                      {FIRM_INFO.leadCounsel.credentials}
                    </p>
                    <p className="mt-0.5 text-xs text-[#A8CC3C] font-semibold">
                      {isBn
                        ? FIRM_INFO.leadCounsel.titleBn
                        : FIRM_INFO.leadCounsel.title}{" "}
                      • {FIRM_INFO.name} ({FIRM_INFO.associatedPractice})
                    </p>
                  </div>
                </div>

                {/* Right Verified Credentials & Core Specialisations */}
                <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#CC242B]">
                    {isBn ? "চেম্বার নেতৃত্ব ও প্রধান আইনজীবী" : "Chamber Leadership"}
                  </span>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1B1E59]">
                    {isBn
                      ? FIRM_INFO.leadCounsel.nameBn
                      : FIRM_INFO.leadCounsel.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-lg bg-white px-3 py-1.5 text-[#2B2E7E] ring-1 ring-[#2B2E7E]/20">
                      {FIRM_INFO.leadCounsel.credentials}
                    </span>
                    <span className="rounded-lg bg-[#EEF9EF] px-3 py-1.5 text-[#247A28] ring-1 ring-[#45B049]/25">
                      {isBn
                        ? FIRM_INFO.leadCounsel.titleBn
                        : FIRM_INFO.leadCounsel.title}
                    </span>
                    <span className="rounded-lg bg-[#FBF6E6] px-3 py-1.5 text-[#9A720F] ring-1 ring-[#C99A1E]/25">
                      Ramna, Dhaka Chamber
                    </span>
                  </div>

                  <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {isBn
                      ? "অ্যাডভোকেট হোসাইন আহমেদ (খান) TaxVat LawAid এবং সহযোগী প্রতিষ্ঠান TaxAid-এর প্রধান আইনজীবী ও স্বত্বাধিকারী। তিনি বাংলাদেশের আয়কর, ভ্যাট, কাস্টমস, আরজেএসসি কোম্পানি কমপ্লায়েন্স এবং আপিলাত ট্রাইব্যুনাল ও হাইকোর্ট রিট পিটিশন পরিচালনায় পেশাদার আইনি পরামর্শ ও প্রতিনিধিত্ব প্রদান করেন।"
                      : "Advocate Hossain Ahmed (Khan) is the Lead Counsel & Proprietor of TaxVat LawAid (Associated Practice: TaxAid) in Ramna, Dhaka. His practice focuses on coordinated Income Tax, VAT, Customs, RJSC corporate governance, Appellate Tribunals, and High Court Division writ proceedings across Bangladesh."}
                  </p>

                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2B2E7E]">
                      {isBn ? "মূল বিশেষজ্ঞতার ক্ষেত্র" : "Core Practice Specialisation"}
                    </p>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                      {(isBn
                        ? FIRM_INFO.leadCounsel.pillarsBn
                        : FIRM_INFO.leadCounsel.pillarsEn
                      ).map((pillar) => (
                        <li
                          key={pillar}
                          className="flex items-start gap-2.5 rounded-xl bg-white p-3.5 ring-1 ring-slate-200/80"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#45B049] mt-0.5" />
                          <span className="text-xs sm:text-sm leading-snug">
                            {pillar}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#appointment"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#2B2E7E] hover:bg-[#1B1E59] px-5 py-3 text-sm font-semibold text-white transition"
                    >
                      <Calendar className="h-4 w-4" />
                      {isBn
                        ? "প্রধান আইনজীবীর সাথে অ্যাপয়েন্টমেন্ট"
                        : "Book Consultation With Lead Counsel"}
                    </a>
                    <a
                      href={`tel:${FIRM_INFO.phones[0].tel}`}
                      onClick={() =>
                        trackPhoneClick(FIRM_INFO.phones[0].display, "lead_counsel")
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-[#1B1E59] ring-1 ring-slate-300 transition"
                    >
                      <Phone className="h-4 w-4 text-[#CC242B]" />
                      01614-446444
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 7: WHO WE HELP (BANGLADESH TARGET AUDIENCES)
        ==================================================================== */}
        <section
          id="who-we-help"
          className="py-20 bg-[#F6F7FC] border-t border-slate-200/70"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2B2E7E]">
                <Users className="h-4 w-4 text-[#45B049]" />
                {isBn ? "যাদের আমরা সেবা প্রদান করি" : "Who We Help Across Bangladesh"}
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1B1E59]">
                {isBn
                  ? "ব্যবসা, কর্পোরেট প্রতিষ্ঠান ও ব্যক্তিগত করদাতাদের জন্য উপযোগী সেবা"
                  : "Dedicated Support for Businesses, Corporates & Taxpayers"}
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {isBn
                  ? "ঢাকা থেকে শুরু করে সারা বাংলাদেশের উদ্যোক্তা, আমদানিকারক, ভ্যাট নিবন্ধিত প্রতিষ্ঠান ও ব্যক্তিগত করদাতাদের জন্য নির্ভরযোগ্য আইনি সহায়তা।"
                  : "Whether you run a growing SME in Dhaka, import commercial cargo, manage a limited company, or need individual income tax or courtroom representation, we tailor our counsel to your exact status."}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHO_WE_HELP.map((segment, index) => {
                const icons = [
                  Briefcase,
                  Building2,
                  Globe,
                  FileCheck2,
                  Award,
                  Users,
                  Landmark,
                  Scale,
                ];
                const Icon = icons[index % icons.length];
                return (
                  <div
                    key={segment.titleEn}
                    className="rounded-2xl bg-white p-6 shadow-2xs ring-1 ring-slate-200/80 hover:ring-[#2B2E7E]/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0FA] text-[#2B2E7E]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-[#1B1E59]">
                      {isBn ? segment.titleBn : segment.titleEn}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {isBn ? segment.descBn : segment.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 8: SIMPLE CONSULTATION PROCESS (6-STEP METHODOLOGY)
        ==================================================================== */}
        <section id="process" className="py-20 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#CC242B]">
                {isBn ? "আমাদের কর্মপদ্ধতি" : "Simple Consultation Process"}
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1B1E59]">
                {isBn
                  ? "স্বচ্ছ ও সুশৃঙ্খল ৬-ধাপের আইনি সেবা প্রক্রিয়া"
                  : "Six Clear Steps From Consultation to Resolution"}
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {isBn
                  ? "প্রাথমিক পরামর্শ থেকে শুরু করে নথি যাচাই, ফাইলিং এবং চূড়ান্ত প্রমাণপত্র হস্তান্তর পর্যন্ত প্রতিটি ধাপ সুস্পষ্ট।"
                  : "Every client engagement follows a structured, documented workflow so you always know the applicable law, required documents, timeline, and next step."}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-2xl bg-[#F6F7FC] p-6 border border-slate-200/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2B2E7E] font-mono text-sm font-bold text-white shadow-xs">
                      {step.step}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C99A1E]">
                      {isBn ? `ধাপ ${step.step}` : `Step ${step.step}`}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold text-[#1B1E59]">
                    {isBn ? step.titleBn : step.titleEn}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {isBn ? step.descBn : step.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 9: PREMIUM APPOINTMENT BOOKING FORM (+ STATUS LOOKUP)
        ==================================================================== */}
        <AppointmentBookingSection
          locale={locale}
          preselectedService={selectedBookingService}
        />

        {/* COMPACT CONVERSION FAQ ACCORDION */}
        <section className="py-16 bg-white border-t border-slate-200/70">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2B2E7E]">
                {isBn ? "সাধারণ জিজ্ঞাসা" : "Quick Answers"}
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#1B1E59]">
                {isBn
                  ? "অ্যাপয়েন্টমেন্ট ও সেবা সংক্রান্ত সাধারণ প্রশ্নোত্তর"
                  : "Frequently Asked Questions"}
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, idx) => {
                const open = openFaqIndex === idx;
                return (
                  <div
                    key={faq.qEn}
                    className="rounded-xl border border-slate-200 bg-[#F6F7FC]/60 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? null : idx)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#1B1E59]">
                        {isBn ? faq.qBn : faq.qEn}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#2B2E7E] transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {open ? (
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                        {isBn ? faq.aBn : faq.aEn}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 10: CONTACT INFORMATION, CHAMBER MAP & FOOTER
        ==================================================================== */}
        <section
          id="contact"
          className="py-20 bg-[#F6F7FC] border-t border-slate-200/80"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Contact Details Card */}
              <div className="lg:col-span-5 rounded-2xl bg-white p-7 sm:p-8 shadow-sm ring-1 ring-slate-200/90 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#CC242B]">
                    {isBn ? "চেম্বার ও যোগাযোগের ঠিকানা" : "Dhaka Chamber Directory"}
                  </span>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#1B1E59]">
                    {isBn ? "আমাদের রমনা চেম্বারে যোগাযোগ করুন" : "Visit or Contact Our Chamber"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {FIRM_INFO.name} • Associated Practice: {FIRM_INFO.associatedPractice}
                  </p>

                  <div className="mt-6 space-y-5 text-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FA] text-[#2B2E7E]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {isBn ? "চেম্বারের ঠিকানা" : "Chamber Address"}
                        </p>
                        <p className="mt-0.5 text-slate-600 leading-relaxed">
                          {isBn ? FIRM_INFO.address.fullBn : FIRM_INFO.address.full}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF1F2] text-[#CC242B]">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {isBn ? "সরাসরি ফোন" : "Direct Telephone"}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-slate-700 font-medium">
                          {FIRM_INFO.phones.map((p) => (
                            <a
                              key={p.raw}
                              href={`tel:${p.tel}`}
                              onClick={() => trackPhoneClick(p.display, "contact_section")}
                              className="hover:text-[#CC242B] underline-offset-2 hover:underline"
                            >
                              {p.display}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF9EF] text-[#45B049]">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {isBn ? "অফিশিয়াল হোয়াটসঅ্যাপ" : "Official WhatsApp"}
                        </p>
                        <a
                          href={FIRM_INFO.whatsapp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackWhatsAppClick("contact_section")}
                          className="mt-0.5 inline-block text-[#247A28] font-semibold hover:underline"
                        >
                          {FIRM_INFO.whatsapp.display} — Chat Now
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBF6E6] text-[#C99A1E]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {isBn ? "ইমেইল ও ওয়েবসাইট" : "Email & Main Website"}
                        </p>
                        <p className="mt-0.5 text-slate-600">
                          <a
                            href={`mailto:${FIRM_INFO.email}`}
                            className="hover:text-[#2B2E7E] font-medium"
                          >
                            {FIRM_INFO.email}
                          </a>
                        </p>
                        <a
                          href={FIRM_INFO.existingVercelSite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#2B2E7E] hover:underline"
                        >
                          www.taxvatlawaid.com
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FA] text-[#2B2E7E]">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B1E59]">
                          {isBn ? "চেম্বার সময়সূচি" : "Consultation Hours"}
                        </p>
                        <p className="mt-0.5 text-slate-700 font-medium">
                          {isBn ? FIRM_INFO.hours.bn : FIRM_INFO.hours.en}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isBn ? FIRM_INFO.hours.closedBn : FIRM_INFO.hours.closedEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Ramna Chamber Map */}
              <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/90 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#1B1E59]">
                      Eastern Mansion, 67/9 Pioneer Road, Ramna, Dhaka
                    </p>
                    <p className="text-xs text-slate-500">
                      Lift-14, Suite 14/7 • Central Ramna Business &amp; Legal District
                    </p>
                  </div>
                  <a
                    href={FIRM_INFO.address.mapsQuery}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#EEF0FA] hover:bg-[#2B2E7E] px-3 py-2 text-xs font-semibold text-[#2B2E7E] hover:text-white transition"
                  >
                    <span>Open Map</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="flex-1 min-h-[340px] bg-slate-100">
                  <iframe
                    title="TaxVat LawAid Ramna Dhaka Chamber Location"
                    src={FIRM_INFO.address.mapsEmbed}
                    className="w-full h-full min-h-[340px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#12143D] text-slate-300 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
            <div className="md:col-span-5">
              <BrandLogo variant="dark" compact />
              <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md">
                {isBn
                  ? FIRM_INFO.taglineBn
                  : `${FIRM_INFO.tagline}. Integrated assistance in Income Tax, VAT, Customs, RJSC Company Law, IP, Corporate Compliance, Tribunals & High Court Writs.`}
              </p>
            </div>

            <div className="md:col-span-4 space-y-2 text-sm">
              <p className="font-semibold text-white">
                {isBn ? "চেম্বার ও যোগাযোগ" : "Chamber & Contact"}
              </p>
              <p className="text-slate-300 text-xs leading-relaxed">
                {FIRM_INFO.address.full}
              </p>
              <p className="text-xs text-slate-300">
                Phone: {FIRM_INFO.phones[0].display} / {FIRM_INFO.phones[1].display}
              </p>
              <p className="text-xs text-slate-300">Email: {FIRM_INFO.email}</p>
              <p className="text-xs text-[#E0B437]">{FIRM_INFO.hours.en}</p>
            </div>

            <div className="md:col-span-3 space-y-2 text-sm">
              <p className="font-semibold text-white">
                {isBn ? "দ্রুত লিংক" : "Quick Links"}
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="#services" className="hover:text-white transition">
                    {isBn ? "আইন ও কর সেবাসমূহ" : "Legal & Tax Services"}
                  </a>
                </li>
                <li>
                  <a href="#lead-counsel" className="hover:text-white transition">
                    {isBn ? "প্রধান আইনজীবী" : "Lead Counsel Profile"}
                  </a>
                </li>
                <li>
                  <a href="#appointment" className="hover:text-white transition">
                    {isBn ? "অ্যাপয়েন্টমেন্ট বুকিং" : "Book Appointment"}
                  </a>
                </li>
                <li>
                  <a
                    href={FIRM_INFO.existingVercelSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white transition"
                  >
                    {isBn ? "মূল ওয়েবসাইট দেখুন" : "Visit Full Website"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} {FIRM_INFO.name} (Associated Practice:{" "}
              {FIRM_INFO.associatedPractice}). All rights reserved. Dhaka, Bangladesh.
            </p>
            <div className="flex items-center gap-4">
              <span>
                General statutory information only; verify current Finance Act, SROs &amp;
                rules prior to filing.
              </span>
              <Link
                href="/admin"
                className="text-slate-400 hover:text-white transition whitespace-nowrap"
              >
                Chamber Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CONVERSION BAR (Call + WhatsApp + Book) */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${FIRM_INFO.phones[0].tel}`}
            onClick={() => trackPhoneClick(FIRM_INFO.phones[0].display, "mobile_bar")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#EEF0FA] py-2.5 text-xs font-bold text-[#1B1E59]"
          >
            <Phone className="h-4 w-4 text-[#2B2E7E]" />
            {isBn ? "কল" : "Call"}
          </a>
          <a
            href={FIRM_INFO.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("mobile_bar")}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#45B049] py-2.5 text-xs font-bold text-white"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href="#appointment"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#CC242B] py-2.5 text-xs font-bold text-white"
          >
            <Calendar className="h-4 w-4" />
            {isBn ? "বুকিং" : "Book"}
          </a>
        </div>
      </div>
    </div>
  );
}
