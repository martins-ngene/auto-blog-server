const moment = require("moment-timezone");

// This function creates a new array of the fields needed by the server from the events on the calender
const formatEvents = events => {
  let data = events.map(event => {
    return {
      event_id: event.id,
      title: event.title,
      location: event.location,
      description: event.description,
      when: event.when,
    };
  });
  return data;
};

// This function is used to convert the dateTime Int value gotten from the calender to string in the format
// needed to set schedules for cron jobs to run
const formatDateString = dateTime => {
  // Convert from timestamp Int to Epoch Time strings to ISOString datetime and finally to specified timezone

  const dateTimeString = moment
    .tz(new Date(new Date(0).setUTCSeconds(dateTime)), "Africa/Lagos")
    .toString();

  // Create an array of characters from the string
  const dateArr = dateTimeString.split("");

  //  Separate the strings into components
  const month = dateArr.slice(4, 7).join("");
  const day = dateArr.slice(8, 10).join("");
  const hour = dateArr.slice(16, 18).join("");
  const minute = dateArr.slice(19, 21).join("");

  //   Return as a single string
  return minute + " " + hour + " " + day + " " + month;
};

// Function to get last three posts from array
const getLastElement = arr => {
  const result = arr.slice(-1);
  return result;
};

module.exports = {
  formatEvents,
  formatDateString,
  getLastElement,
};
