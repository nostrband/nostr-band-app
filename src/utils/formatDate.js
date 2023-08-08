export function formatAMPM(date) {
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

  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  let year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  let seconds = dateObj.getSeconds();
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
