import config from "common/config";

export const formatDate = (dateInMillis: number, format: string): string => {
  if (dateInMillis && format === "yyyy-mm-dd") {
    const date = new Date(dateInMillis);
    let monthString = String(date.getMonth() + 1),
      dateString = String(date.getDate());

    dateString = dateString.length < 2 ? "0" + dateString : String(dateString);
    monthString = monthString.length < 2 ? "0" + monthString : String(monthString);

    return date.getFullYear() + "-" + monthString + "-" + dateString;
  }

  return "";
};

export const getAllSupportedWebURLs = () => {
  const webURLsSet = new Set([config.WEB_URL, ...config.OTHER_WEB_URLS]);
  return [...webURLsSet];
};

export const isAppURL = (url: string) => {
  return !!url && getAllSupportedWebURLs().some((webURL) => url.includes(webURL));
};

export const generateUrlPattern = (urlString: string) => {
  try {
    const webUrlObj = new URL(urlString);
    return `${webUrlObj.protocol}//${webUrlObj.host}/*`;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    return null;
  }
};

export const getUrlObject = (url: string): URL | undefined => {
  // Url obj fails to construct when chrome:// or similar urls are passed
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (error) {
    return null;
  }
};
