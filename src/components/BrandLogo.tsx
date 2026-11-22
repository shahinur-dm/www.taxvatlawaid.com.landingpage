import Image from "next/image";
import { FIRM_INFO } from "@/data/firm";

interface BrandLogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
  customLogoSrc?: string;
}

export function BrandLogo({ variant = "light", compact = false, customLogoSrc }: BrandLogoProps) {
  const isDark = variant === "dark";
  const logoSrc = customLogoSrc || "/images/taxvat-lawaid-logo.png";

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`relative shrink-0 rounded-full bg-white p-0.5 shadow-sm ring-1 ${
          isDark ? "ring-white/25" : "ring-navy-800/15"
        }`}
      >
        <Image
          src={logoSrc}
          alt="TaxVat LawAid Official Logo"
          width={compact ? 42 : 50}
          height={compact ? 47 : 56}
          className={compact ? "h-11 w-auto object-contain" : "h-13 w-auto object-contain"}
          priority
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
          <span className="text-[#CC242B]">Tax</span>
          <span className="text-[#45B049]">Vat</span>{" "}
          <span className={isDark ? "text-white" : "text-[#2B2E7E]"}>
            LawAid
          </span>
        </span>
        <span
          className={`mt-1 text-[11px] font-medium tracking-wide ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Associated Practice:{" "}
          <span className="font-semibold text-[#CC242B]">Tax</span>
          <span className={`font-semibold ${isDark ? "text-[#A8CC3C]" : "text-[#2B2E7E]"}`}>
            {FIRM_INFO.associatedPractice.slice(3)}
          </span>
        </span>
      </div>
    </div>
  );
}
