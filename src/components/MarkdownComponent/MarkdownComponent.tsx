import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import cl from "./MarkdownComponent.module.css";
import { useState } from "react";

type MarkdownType = {
  content: string;
  mode?: string;
};

type linkType = {
  children: string[];
  href: string;
};

const MarkdownComponent = (props: MarkdownType) => {
  const [isFullContent, setIsFullContent] = useState<boolean>(false);

  if (props.content) {
    const MAX_CONTENT_LENGTH = 300;

    const fullContent = isFullContent
      ? props.content
      : props.content.slice(0, MAX_CONTENT_LENGTH) + "...";

    const renderLink = ({ children, href }: linkType) => {
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
          //@ts-ignore
          components={{ a: renderLink }}
        >
          {props.mode === "post"
            ? props.content
            : props.content.length <= MAX_CONTENT_LENGTH
            ? props.content
            : fullContent}
        </ReactMarkdown>
        {props.content.length > MAX_CONTENT_LENGTH && props.mode !== "post" && (
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
    return <></>;
  }
};

export default MarkdownComponent;
