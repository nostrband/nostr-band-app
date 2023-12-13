import { useSearchParams } from "react-router-dom";
import Profiles from "./Profiles/Profiles";
import Zaps from "./Zaps/Zaps";
import Posts from "./Posts/Posts";
import AllResults from "./AllResults/AllResults";

const Result = () => {
  const [searchParams] = useSearchParams();
  const kindsList = searchParams
    .get("q")
    ?.match(/kind:\d+/g)
    ?.map((kind) => kind.split(":")[1]);

  if (!kindsList) {
    return <AllResults />;
  }
  if (kindsList.length === 1 && kindsList.includes("0")) {
    return <Profiles />;
  }
  if (kindsList.length === 1 && kindsList.includes("9735")) {
    return <Zaps />;
  }
  if (kindsList.length === 1 && kindsList.includes("1")) {
    return <Posts />;
  }

  return <AllResults />;
};

export default Result;
