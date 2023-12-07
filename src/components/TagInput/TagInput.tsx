import TagsInput from "react-tagsinput";
import "./TagInput.css";

const TagInput = ({
  tags,
  setTags,
  placeholder,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
}) => {
  const handleChange = (tags: string[]) => {
    setTags(tags);
  };
  return (
    <TagsInput
      addOnBlur
      inputProps={{ placeholder }}
      value={tags}
      onChange={handleChange}
    />
  );
};

export default TagInput;
