type stringOrNumber = string | number;

export function formatAMPM(date: number): string {
  let agoTime = "";
  const currentTime = new Date().getTime();
  const elapsedTime = currentTime - date;

  if (currentTime - date <= 86400000) {
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours >= 0) {
      agoTime = `${hours > 1 ? hours : ""} ${
        hours > 1 ? "hours" : "an hour"
      } ago`;
    } else if (minutes >= 0) {
      agoTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
    } else {
      agoTime = `${seconds > 5 ? seconds : ""} ${
        seconds > 5 ? "seconds ago" : "right now"
      }`;
    }
  }

  let dateObj = new Date(date);

  let month: stringOrNumber = dateObj.getMonth() + 1;
  let day: stringOrNumber = dateObj.getDate();
  let year = dateObj.getFullYear();
  let hours: stringOrNumber = dateObj.getHours();
  let minutes: stringOrNumber = dateObj.getMinutes();
  let seconds: stringOrNumber = dateObj.getSeconds();
  let ampm = hours >= 12 ? "PM" : "AM";

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  let formattedTime =
    month +
    "/" +
    day +
    "/" +
    year +
    ", " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm;

  return agoTime ? agoTime : formattedTime;
}

export function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}
