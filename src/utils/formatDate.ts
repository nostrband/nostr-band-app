type stringOrNumber = string | number;

export function formatAMPM(date: number): string {
  let agoTime = "";
  const timeNow = Date.now();

  if (timeNow - date <= 86400000) {
    const time = new Date(timeNow - date);
    if (time.getHours()) {
      const hs = time.getHours();
      agoTime = `${hs > 1 ? hs : ""} ${hs > 1 ? "hours" : "an hour"} ago`;
    } else if (time.getMinutes()) {
      const minutes = time.getMinutes();
      agoTime = `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
    } else {
      const secs = time.getSeconds();
      agoTime = `${secs} ${secs > 5 ? "seconds ago" : "right now"}`;
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
