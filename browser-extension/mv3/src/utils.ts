import { SourceKey, SourceOperator, UrlSource } from "common/types";
import config from "common/config";
import { matchSourceUrl } from "./service-worker/services/ruleMatcher";

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

export const isBlacklistedURL = (url: string): boolean => {
  const blacklistedSources: UrlSource[] = [
    {
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: config.WEB_URL,
    },
    {
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: "__rq", // you can use __rq in the url to blacklist it
    },
  ];

  return blacklistedSources.some((source) => matchSourceUrl(source, url));
};
