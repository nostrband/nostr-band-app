import { useState, useEffect } from "react";
import cl from "./Result.module.css";
import Search from "../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import ProfileItem from "../Home/People/ProfileItem/ProfileItem";

const Result = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("wss://relay.nostr.band");
    setSocket(socket);
    if (socket instanceof WebSocket) {
      let resCount = "";
      const events = [];
      socket.onopen = function (e) {
        socket.onmessage = function (e) {
          const data = JSON.parse(e.data);
          if (data[0] === "EVENT") {
            events.push(data[2]);
            setProfiles(events);
          } else if (data[0] === "COUNT") {
            resCount = data[2];
          }
          // console.log(events);
        };
        socket.onerror = function (err) {
          console.log(err);
        };
        const reqSearch = [
          "REQ",
          1,
          { kinds: [0], search: searchParams.get("q"), limit: 100 },
        ];
        const countRes = [
          "COUNT",
          2,
          { kinds: [1], search: searchParams.get("q") },
        ];
        socket.send(JSON.stringify(reqSearch));
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  return (
    <div className={cl.result}>
      <Search />
      {profiles && profiles?.length ? (
        <div className={cl.resultProfiles}>
          <h2>Profiles</h2>
          {profiles.map((profile) => {
            const profileContent = JSON.parse(profile.content);
            console.log(profileContent);
            return (
              <ProfileItem
                img={profileContent.picture}
                pubKey={profile.pubkey}
                bio={profileContent.about}
                name={
                  profileContent.display_name
                    ? profileContent.display_name
                    : profileContent.name
                }
                key={profile.id}
                mail={profileContent.nip05}
              />
            );
          })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Result;
