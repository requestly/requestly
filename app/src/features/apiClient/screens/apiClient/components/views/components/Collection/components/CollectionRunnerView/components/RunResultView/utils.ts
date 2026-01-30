import moment from "moment";

/** time in ms */
export function getFormattedStartTime(time: number) {
  return moment(time).format("MMM DD, YYYY [at] HH:mm:ss");
}

export function getFormattedTime(time: number) {
  const duration = moment.duration(time, "milliseconds");

  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  const milliseconds = duration.milliseconds();

  let result = [];

  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0) result.push(`${seconds}s`);
  if (milliseconds > 0) result.push(`${milliseconds}ms`);

  return result.join(" ") || "0ms";
}

export const getEmptyBodyMessage = (type: "request" | "response", method?: string, statusCode?: number): string => {
  if (type === "request") {
    if (method === "GET" || method === "HEAD") {
      return `${method} requests typically don't have a body`;
    }
    return "Request body not available";
  }
  // Response type
  if (statusCode) {
    if (statusCode >= 500) {
      return "Server error - No response body";
    }
    if (statusCode >= 400) {
      return "Client error - No response body";
    }
    if (statusCode === 204) {
      return "No content (204)";
    }
  }
  if (method === "GET" || method === "HEAD") {
    return "No response body received";
  }
  return "No body content";
};
