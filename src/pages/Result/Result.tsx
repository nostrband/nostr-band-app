import { useSearchParams } from "react-router-dom";
import Profiles from "./Profiles/Profiles";
import AllResults from "./TopResults/TopResults";
import Zaps from "./Zaps/Zaps";
import Posts from "./Posts/Posts";

const Result = () => {
  const [searchParams] = useSearchParams();
  const kindsList = searchParams
    .get("q")
    ?.match(/kind:\d+/g)
    ?.map((kind) => kind.split(":")[1]);

  if (!kindsList) {
    return <AllResults />;
  } else if (kindsList.length === 1 && kindsList.includes("0")) {
    return <Profiles />;
  } else if (kindsList.length === 1 && kindsList.includes("9735")) {
    return <Zaps />;
  } else if (kindsList.length === 1 && kindsList.includes("1")) {
    return <Posts />;
  }
  return <AllResults />;
};

export default Result;
