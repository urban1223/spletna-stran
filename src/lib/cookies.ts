export type CookieConsent = "necessary" | "all";

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];

export const getCookieConsent = (): CookieConsent | null => {
  const value = getCookie("nova_cookie_consent");
  return value === "all" || value === "necessary" ? value : null;
};

export const setCookieConsent = (consent: CookieConsent) => {
  document.cookie = `nova_cookie_consent=${consent}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("cookie-consent-changed"));
};

export const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
};

export const getSessionCookie = (name: string) => getCookie(name);

export const setSessionCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
};
