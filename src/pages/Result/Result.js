import { useState, useEffect } from "react";
import cl from "./Result.module.css";
import { useSearchParams } from "react-router-dom";
import Profiles from "./Profiles/Profiles";
import AllResults from "./AllResults/AllResults";
import Zaps from "./Zaps/Zaps";

const Result = () => {
  const [searchParams] = useSearchParams();

  if (!searchParams.get("type")) {
    return <AllResults />;
  } else if (searchParams.get("type") === "profiles") {
    return <Profiles />;
  } else if (searchParams.get("type") === "zaps") {
    return <Zaps />;
  }
  return <AllResults />;
};

export default Result;
