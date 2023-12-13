import { ReactTags } from "react-tag-autocomplete";
import "./TagInput.css";
import { useCallback, useRef } from "react";

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
  const onDelete = useCallback(
    (tagIndex: number) => {
      setTags(tags.filter((_, i) => i !== tagIndex));
    },
    [tags]
  );

  const onAdd = useCallback(
    (newTag: tagType) => {
      const newTagTrim = { ...newTag, label: newTag.label.replaceAll(" ", "") };
      console.log(newTagTrim);
      setTags([...tags, newTagTrim]);
    },
    [tags]
  );

  return (
    <ReactTags
      delimiterKeys={[" ", "Enter"]}
      activateFirstOption
      allowNew
      placeholderText={placeholder}
      selected={tags}
      suggestions={suggestions}
      onAdd={onAdd}
      onDelete={onDelete}
      noOptionsText="No matching tags"
    />
  );
};

export default TagInput;
