"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface UtmAttribution {
  leadSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
  referrerUrl?: string;
  landingPageUrl?: string;
}

const UTM_STORAGE_KEY = "tvla_utm_attribution_v1";

/**
 * Captures UTM parameters, fbclid, gclid, and referrer on initial landing and
 * persists them in sessionStorage so anchor clicks never drop ad attribution.
 */
export function captureAttributionOnLoad(): UtmAttribution {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const incoming: UtmAttribution = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
    fbclid: params.get("fbclid") || undefined,
    gclid: params.get("gclid") || undefined,
  };

  const hasIncomingAdsParams = Object.values(incoming).some(Boolean);

  try {
    const existingRaw = sessionStorage.getItem(UTM_STORAGE_KEY);
    const existing: UtmAttribution = existingRaw ? JSON.parse(existingRaw) : {};

    const merged: UtmAttribution = {
      ...existing,
      ...(hasIncomingAdsParams ? incoming : {}),
      referrerUrl: existing.referrerUrl || document.referrer || undefined,
      landingPageUrl: existing.landingPageUrl || window.location.href,
    };

    if (!merged.leadSource) {
      if (merged.utmSource) merged.leadSource = merged.utmSource;
      else if (merged.fbclid) merged.leadSource = "facebook_ads";
      else if (merged.gclid) merged.leadSource = "google_ads";
      else merged.leadSource = "direct";
    }

    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return {
      ...incoming,
      referrerUrl: document.referrer || undefined,
      landingPageUrl: window.location.href,
    };
  }
}

export function getStoredAttribution(): UtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : captureAttributionOnLoad();
  } catch {
    return {};
  }
}

export function trackWhatsAppClick(location: string) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: location,
    });
  }
  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact", {
      content_name: "WhatsApp Chamber Desk",
      content_category: location,
    });
  }
}

export function trackPhoneClick(phone: string, location: string) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", "phone_click", {
      event_category: "engagement",
      event_label: `${phone} (${location})`,
    });
  }
  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact", {
      content_name: `Phone Call ${phone}`,
      content_category: location,
    });
  }
}

export function trackAppointmentSubmitted(payload: {
  inquiryId: string;
  serviceCategory: string;
  consultationType: string;
  clientType: string;
}) {
  if (typeof window === "undefined") return;

  // GA4 lead event
  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      event_category: "appointment",
      event_label: payload.serviceCategory,
      consultation_type: payload.consultationType,
      client_type: payload.clientType,
      transaction_id: payload.inquiryId,
    });

    // Google Ads conversion event (fires when env IDs are configured)
    const gadsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const gadsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (gadsId && gadsLabel) {
      window.gtag("event", "conversion", {
        send_to: `${gadsId}/${gadsLabel}`,
        transaction_id: payload.inquiryId,
      });
    }
  }

  // Meta Pixel Lead + Schedule events
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", {
      content_name: payload.serviceCategory,
      content_category: payload.clientType,
    });
    window.fbq("track", "Schedule", {
      content_name: payload.consultationType,
      content_category: payload.serviceCategory,
    });
  }
}
