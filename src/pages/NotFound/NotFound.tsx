import { ExclamationTriangle } from "react-bootstrap-icons";
import cl from "./NotFound.module.css";
import { Link } from "react-router-dom";
import Search from "../../components/Search/Search";

const NotFound = () => {
  return (
    <div className={cl.notFound}>
      <div className={cl.notFoundInfo}>
        <h2>404</h2>
        <div className={cl.notFoundInfoContent}>
          <p className={cl.notFoundInfoContentTitle}>
            <ExclamationTriangle color="--bg-secondary-color" />
            &nbsp;Oops! Page not found.
          </p>
          <p>The page you are looking for was not found.</p>
          <p>
            You may return to <Link to={"/"}>home page</Link> or try using the
            search form.
          </p>
        </div>
      </div>
      <div className={cl.notFoundSearch}>
        <Search placeholder="What are you looking for?" isLoading={false} />
      </div>
    </div>
  );
};

export default NotFound;
