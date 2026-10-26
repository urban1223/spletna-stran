import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCookieConsent } from "@/lib/cookies";

const MEASUREMENT_ID = "G-GBSTBT8T37";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const sendPageView = (path: string) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("config", MEASUREMENT_ID, { page_path: path });
};

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    const loadAnalytics = () => {
      if (getCookieConsent() !== "all" || document.getElementById("ga4-script")) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
      window.gtag("js", new Date());
      window.gtag("config", MEASUREMENT_ID, { anonymize_ip: true });

      const script = document.createElement("script");
      script.id = "ga4-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
    };

    loadAnalytics();
    const handleConsent = () => loadAnalytics();
    window.addEventListener("cookie-consent-changed", handleConsent);
    return () => window.removeEventListener("cookie-consent-changed", handleConsent);
  }, []);

  useEffect(() => {
    if (getCookieConsent() === "all") sendPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (getCookieConsent() !== "all" || typeof window.gtag !== "function") return;
      const target = event.target as HTMLElement;
      const link = target.closest("a[data-analytics-event]");
      if (!link) return;
      window.gtag("event", link.getAttribute("data-analytics-event") || "link_click", {
        link_url: (link as HTMLAnchorElement).href,
      });
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
};

export default Analytics;
