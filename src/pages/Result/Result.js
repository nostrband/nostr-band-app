import { useState, useEffect } from "react";
import cl from "./Result.module.css";
import { useSearchParams } from "react-router-dom";
import Profiles from "./Profiles/Profiles";
import AllResults from "./AllResults/AllResults";

const Result = () => {
  const [searchParams] = useSearchParams();

  if (!searchParams.get("type")) {
    return <AllResults />;
  } else if (searchParams.get("type") === "profiles") {
    return <Profiles />;
  }
  return <AllResults />;
};

export default Result;
