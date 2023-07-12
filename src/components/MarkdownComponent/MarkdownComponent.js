import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import cl from "./MarkdownComponent.module.css";
import { useState } from "react";

const MarkdownComponent = ({ content }) => {
  const [isFullContent, setIsFullContent] = useState(false);

  if (content) {
    const MAX_CONTENT_LENGTH = 300;

    const fullContent = isFullContent
      ? content
      : content.slice(0, MAX_CONTENT_LENGTH);

    const renderLink = ({ children, href }) => {
      return (
        <Link to={href} target="_blanc">
          {children[0]
            .replace(/^(https|http)?:\/\//, "")
            .replace(/(.{16}).*(.{10})$/, "$1...$2")}
        </Link>
      );
    };

    return (
      <>
        <ReactMarkdown
          className={cl.postAbout}
          remarkPlugins={[remarkGfm]}
          components={{ a: renderLink }}
        >
          {fullContent}
        </ReactMarkdown>
        {content.length > MAX_CONTENT_LENGTH && (
          <button
            className={cl.postMoreBtn}
            onClick={() => setIsFullContent(!isFullContent)}
          >
            {isFullContent ? "Hide" : "Show more"}
          </button>
        )}
      </>
    );
  } else {
    return "";
  }
};

export default MarkdownComponent;
