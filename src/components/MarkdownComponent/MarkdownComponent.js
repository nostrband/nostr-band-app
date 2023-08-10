import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import cl from "./MarkdownComponent.module.css";
import { useState } from "react";

const MarkdownComponent = ({ content, mode }) => {
  const [isFullContent, setIsFullContent] = useState(false);

  if (content) {
    const MAX_CONTENT_LENGTH = 300;

    const fullContent = isFullContent
      ? content
      : content.slice(0, MAX_CONTENT_LENGTH) + "...";

    const renderLink = ({ children, href }) => {
      return (
        <Link to={href} onClick={(e) => e.stopPropagation()}>
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
          {mode === "post"
            ? content
            : content.length <= MAX_CONTENT_LENGTH
            ? content
            : fullContent}
        </ReactMarkdown>
        {content.length > MAX_CONTENT_LENGTH && mode !== "post" && (
          <button
            className={cl.postMoreBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsFullContent(!isFullContent);
            }}
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
