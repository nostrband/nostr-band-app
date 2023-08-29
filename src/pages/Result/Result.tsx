import { useSearchParams } from "react-router-dom";
//@ts-ignore
import Profiles from "./Profiles/Profiles.tsx";
//@ts-ignore
import AllResults from "./AllResults/AllResults.tsx";
//@ts-ignore
import Zaps from "./Zaps/Zaps.tsx";
//@ts-ignore
import Posts from "./Posts/Posts.tsx";
import React from "react";

const Result = () => {
  const [searchParams] = useSearchParams();

  if (!searchParams.get("type")) {
    return <AllResults />;
  } else if (searchParams.get("type") === "profiles") {
    return <Profiles />;
  } else if (searchParams.get("type") === "zaps") {
    return <Zaps />;
  } else if (searchParams.get("type") === "posts") {
    return <Posts />;
  }
  return <AllResults />;
};

export default Result;
