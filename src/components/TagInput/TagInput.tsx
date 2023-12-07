import { ReactTags } from "react-tag-autocomplete";
import "./TagInput.css";
import { useCallback, useRef, useState } from "react";

type tagType = {
  value: number;
  label: string;
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

  const onAdd = useCallback(
    (newTag: tagType) => {
      setTags([...tags, newTag]);
    },
    [tags]
  );

  return (
    <ReactTags
      allowNew
      labelText={placeholder}
      selected={tags}
      suggestions={suggestions}
      onAdd={onAdd}
      onDelete={onDelete}
      noOptionsText="No matching countries"
    />
  );
};

export default TagInput;
