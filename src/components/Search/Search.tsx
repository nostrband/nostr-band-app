import "./Search.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Button } from "react-bootstrap";
import { Search as SearchIcon } from "react-bootstrap-icons";
import Spinner from "react-bootstrap/Spinner";
import { FC, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import React from "react";

type searchTypes = {
  isLoading: boolean;
};

const Search: FC<searchTypes> = ({ isLoading }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("q") ? searchParams.get("q") : ""
  );
  const [selectValue, setSelectValue] = useState(
    searchParams.get("type") ? searchParams.get("type") : ""
  );

  const searchHandleByEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate({
        pathname: "/",
        search:
          selectValue && inputValue
            ? createSearchParams({
                q: inputValue,
                type: selectValue,
              }).toString()
            : inputValue
            ? createSearchParams({ q: inputValue }).toString()
            : "",
      });
    }
  };

  const searchHandle = () => {
    navigate({
      pathname: "/",
      search:
        selectValue && inputValue
          ? createSearchParams({ q: inputValue, type: selectValue }).toString()
          : inputValue
          ? createSearchParams({ q: inputValue }).toString()
          : "",
    });
  };

  return (
    <>
      <InputGroup className="mb-3" id="search-input">
        <Form.Control
          value={inputValue ? inputValue : ""}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Keyword, hashtag, pubkey or post ID"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
          onKeyDown={searchHandleByEnter}
        />
        {isLoading && (
          <div className="loader">
            <Spinner size="sm" animation="border" />
          </div>
        )}

        <div id="dropdown-basic">
          <Form.Select
            onChange={(e) => setSelectValue(e.currentTarget.value)}
            value={selectValue ? selectValue : ""}
          >
            <option value="">All</option>
            <option value="posts">Posts</option>
            <option value="profiles">Profiles</option>
            <option value="zaps">Zaps</option>
          </Form.Select>
        </div>
        <Button
          className="btn"
          id="search-btn"
          variant="secondary"
          onClick={searchHandle}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </>
  );
};

export default Search;
