// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../config/constants";

export const generateObjectId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export const generateSharedListId = () => {
  return Date.now();
};

//eg "sharedLists" -> "shared lists"
export const getPrettyString = (string) => {
  return string
    .replaceAll("_", " ")
    .match(/([A-Z]?[^A-Z]*)/g)
    .slice(0, -1)
    .map((word) => word.toLowerCase())
    .join(" ");
};

export const getPrettyPlanName = (planName) => {
  if (!planName) return "Free";
  if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.BRONZE) return "Free";
  if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.GOLD) return "Professional";
  if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE)
    return "Professional";

  return planName
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
};

export const isValidRQUrl = (url) => {
  let url_obj = null;
  try {
    url_obj = new URL(url);
  } catch (e) {
    return false;
  }

  return url_obj.origin === window.location.origin;
};

export const getDomainFromEmail = (email) => {
  if (!email) return;
  return email.split("@")[1];
};

export const isCompanyEmail = (email) => {
  const domain = getDomainFromEmail(email);
  if (!domain) {
    return false;
  }
  return !(
    APP_CONSTANTS.EMAIL_DOMAINS.PERSONAL.includes(domain) ||
    APP_CONSTANTS.EMAIL_DOMAINS.DESTROYABLE.includes(domain)
  );
};

export const getByteSize = (inputString) => {
  return new Blob([inputString]).size;
};

export const getEmailType = (email) => {
  const domain = getDomainFromEmail(email);
  if (!domain) {
    return "UNDEFINED";
  } else if (APP_CONSTANTS.EMAIL_DOMAINS.PERSONAL.includes(domain)) {
    return "PERSONAL";
  } else if (APP_CONSTANTS.EMAIL_DOMAINS.DESTROYABLE.includes(domain)) {
    return "DESTROYABLE";
  } else if (isCompanyEmail(email)) {
    return "BUSINESS";
  } else return "UNDEFINED";
};

export const getGreeting = () => {
  const myDate = new Date();
  const hrs = myDate.getHours();

  if (hrs < 12) return "Good Morning";
  else if (hrs >= 12 && hrs <= 17) return "Good Afternoon";
  else return "Good Evening";
};

export const filterUniqueObjects = (myArr) => {
  const seen = new Set();
  return myArr.filter((el) => {
    const duplicate = seen.has(el.id);
    seen.add(el.id);
    return !duplicate;
  });
};

export const getCountryNameFromISOCode = (ISOCode) => {
  const countryCodeObject = APP_CONSTANTS.PRICING.COUNTRY_CODES.find(
    (object) => object.value === ISOCode
  );

  if (countryCodeObject) {
    return countryCodeObject.label;
  } else return null;
};

export const getPrettyAppModeName = (appMode) => {
  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      return "Browser Extension";
    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      return "Desktop App";
    case GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE:
      return "Cloudflare App";
    case GLOBAL_CONSTANTS.APP_MODES.WORDPRESS:
      return "Wordpress Plugin";
    default:
      return getPrettyString(appMode);
  }
};

export const getShortAppModeName = (appMode) => {
  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      return "Extension";
    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      return "Desktop App";
    case GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE:
      return "Cloudflare";
    case GLOBAL_CONSTANTS.APP_MODES.WORDPRESS:
      return "Wordpress";
    default:
      return getPrettyString(appMode);
  }
};

export const removeTrailingSlash = (url) => {
  return url.replace(/\/$/, "");
};

export const isEmailValid = (email) => {
  return (
    email &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
};
