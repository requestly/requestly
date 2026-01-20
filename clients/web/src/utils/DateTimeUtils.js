import moment from "moment";

/**
 * To Check whether today's date is in between Date which comes after adding some days in signUp date and user signup date
 * @param {String} signupDate
 * @param {Number} numDaysToAdd
 * @returns {Boolean}
 */
export const getDateAfterAddingSomeDaysInUserSignupDate = (signupDate, numDaysToAdd) => {
  // eslint-disable-next-line
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  var date = new Date(signupDate);
  return (
    new Date().getTime() <=
    new Date(
      date.addDays(numDaysToAdd).getFullYear() +
        "-" +
        (date.addDays(numDaysToAdd).getMonth() + 1) +
        "-" +
        date.addDays(numDaysToAdd).getDate()
    ).getTime()
  );
};

export const dateStringFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const fullDate = day + "/" + (month + 1) + "/" + year;

  return isNaN(day) ? null : fullDate;
};

/** Returns date based on the format passed  */
export const getFormattedDate = (format = "DD-MM-YYYY", timestamp = new Date()) => {
  const momentObj = moment(timestamp);
  return momentObj.format(format);
};

export const getOldestDate = (arrayOfDates = []) => {
  // Get all dates in "YYYY-MM-DD" format
  const datesArray = arrayOfDates.map((date) => {
    if (date) return standardizeDateFormat(date);
    else return null;
  });
  // Create a sorted array of dates
  // null is auto moved to last
  const sortedDatesArr = datesArray.sort();
  // Return the oldest
  return sortedDatesArr[0];
};

// Any date to -> "2022-02-03"
export const standardizeDateFormat = (date) => {
  let dateObj;
  if (!date) {
    // if date is null or undefined
    dateObj = new Date();
  } else {
    // if date is in epoch or isoString format
    dateObj = new Date(date);
  }
  return dateObjToDateString(dateObj);
};

// returns date in YYYY-MM-DD format
export const dateObjToDateString = (dateObj) => {
  return dateObj.toISOString().split("T")[0];
};

export const epochToLocaleTime = (epoch) => {
  const myDate = new Date(epoch);
  return myDate.toLocaleTimeString("en-CA");
};

export const epochToLocaleDate = (epoch) => {
  const myDate = new Date(epoch);
  return myDate.toLocaleDateString("en-CA");
};

export const epochToDate = (epoch) => {
  const myDate = new Date(epoch);
  return myDate.toDateString();
};

export const getDateString = (dateObj) => {
  return dateObj.toLocaleDateString("en-CA");
};

export const getLongFormatDateString = (dateObj) => {
  return dateObj.toLocaleString("default", { month: "short", day: "numeric", year: "numeric" });
};

export const getCurrentTimeStamp = () => {
  return new Date().getTime();
};

export const generateObjectCreationDate = () => {
  return getCurrentTimeStamp();
};

export const msToMinutesAndSeconds = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  const addPadding = (t) => (t < 10 ? "0" : "") + t;

  return addPadding(minutes) + ":" + addPadding(seconds);
};

export const secToMinutesAndSeconds = (sec) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  const addPadding = (t) => (t < 10 ? "0" : "") + t;

  return addPadding(minutes) + ":" + addPadding(seconds);
};

export const epochToDateAndTimeString = (timestamp) => moment(timestamp).format("DD-MMM-YYYY HH:mm:ss");

export const msToHoursMinutesAndSeconds = (millis) => new Date(millis).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];

export const getTimeDifferenceFromTimestamps = (time1, time2) => {
  // both are epoch times
  const time1DateObj = new Date(time1);
  const time2DateObj = new Date(time2);
  return time1DateObj.getTime() - time2DateObj.getTime(); // in milliseconds
};

//get formatted timestamp in "24 August 2023 - 5:24PM" format
export const getFormattedTimestamp = (timestamp) => {
  const date = new Date(timestamp);

  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const minutes = date.getMinutes();

  const formattedDate = `${day} ${month} ${year} - ${hours}:${minutes < 10 ? "0" : ""}${minutes}${ampm}`;
  return formattedDate;
};

export const getSecondsFromStringifiedMinSec = (timestamp) => {
  if (!timestamp) return 0;
  const parts = timestamp.split(":");
  const minutes = parts[0] || "0";
  const seconds = parts[1] || "0";
  const parsedMinutes = parseInt(minutes, 10);
  const parsedSeconds = parseInt(seconds.substring(0, 2), 10);
  return (isNaN(parsedMinutes) ? 0 : parsedMinutes) * 60 + (isNaN(parsedSeconds) ? 0 : parsedSeconds);
};

export const getDaysDifference = (timestamp) => {
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffTime = Math.abs(now.getTime() - lastSeen.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
