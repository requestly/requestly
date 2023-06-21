import { trackEvent } from "modules/analytics";

export function trackDesktopMainEvent(name: string, param: Record<any, any> = {}) {
  param["source"] = "desktop_main";
  trackEvent(name, param);
}

export function trackDesktopBGEvent(name: string, param: Record<any, any> = {}) {
  param["source"] = "desktop_main";
  trackEvent(name, param);
}
