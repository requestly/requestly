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
