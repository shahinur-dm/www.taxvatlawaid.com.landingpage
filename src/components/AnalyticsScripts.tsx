"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureAttributionOnLoad } from "@/lib/analytics";

export function AnalyticsScripts() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const gadsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const primaryGtagId = ga4Id || gadsId;

  useEffect(() => {
    captureAttributionOnLoad();
  }, []);

  return (
    <>
      {/* Google Analytics 4 & Google Ads Global Tag (deferred after hydration) */}
      {primaryGtagId ? (
        <>
          <Script
            id="gtag-script"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtagId)}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${ga4Id ? `gtag('config', '${ga4Id}', { send_page_view: true });` : ""}
              ${gadsId ? `gtag('config', '${gadsId}');` : ""}
            `}
          </Script>
        </>
      ) : null}

      {/* Meta Pixel (Facebook / Instagram Ads Tracking) */}
      {metaPixelId ? (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}
