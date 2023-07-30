import { useState, useEffect } from "react";
import cl from "./Result.module.css";
import Search from "../../components/Search/Search";

const Result = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("wss://relay.nostr.band");
    setSocket(socket);
    // if(socket instanceof WebSocket) {
    //     const events = [];
    //     let resCount = "";
    //     socket.onopen = function(e) {
    //       console.log(`Connected`);
    //     };
    //     socket.onmessage = function(e) {
    //       const data = JSON.parse(e.data);
    //       if(data[0] === "EVENT") {
    //         events.push(events);
    //       } else if(data[0] === "COUNT") {
    //         resCount = data[2];
    //       }
    //       console.log(resCount);
    //     };
    //     socket.onerror = function(err) {
    //       console.log(err);
    //     };
    //     const reqSearch = ["REQ", 1, {"kinds": [1], "search": inputValue, limit: 100}];
    //     const countRes = ["COUNT", 2, {"kinds": [1], "search": inputValue}];
    //   }
  }, []);

  return (
    <div className={cl.result}>
      <Search />
    </div>
  );
};

export default Result;
