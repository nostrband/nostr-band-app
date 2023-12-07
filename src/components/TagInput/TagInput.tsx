import ReactTags from "react-tag-autocomplete";
import "./TagInput.css";
import { useCallback, useRef, useState } from "react";

type tagType = {
  id: number;
  name: string;
};

const TagInput = ({
  tags,
  setTags,
  placeholder,
  suggestions,
}: {
  tags: tagType[];
  setTags: (tags: tagType[]) => void;
  placeholder: string;
  suggestions: tagType[];
}) => {
  const reactTags = useRef();

  const onDelete = useCallback(
    (tagIndex: number) => {
      setTags(tags.filter((_, i) => i !== tagIndex));
    },
    [tags]
  );

  const onAddition = useCallback(
    (newTag: tagType) => {
      setTags([...tags, newTag]);
    },
    [tags]
  );

  return (
    <ReactTags
      allowNew
      ref={reactTags}
      tags={tags}
      suggestions={suggestions}
      onDelete={onDelete}
      onAddition={onAddition}
      placeholderText={placeholder}
    />
  );
};

export default TagInput;
