import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import cl from "./MarkdownComponent.module.css";

const MarkdownComponent = ({ content }) => {
  const renderLink = ({ children, href }) => {
    return (
      <Link to={href} target="_blanc">
        {children[0]
          .replace(/^(https|http)?:\/\//, "")
          .replace(/(.{11}).*(.{10})$/, "$1...$2")}
      </Link>
    );
  };

  return (
    <ReactMarkdown
      className={cl.postAbout}
      remarkPlugins={[remarkGfm]}
      components={{ a: renderLink }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownComponent;
