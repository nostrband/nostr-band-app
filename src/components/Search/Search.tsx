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
import { useAppSelector } from "../../hooks/redux";

type searchTypes = {
  isLoading: boolean;
  placeholder?: string;
};

const Search: FC<searchTypes> = ({ isLoading, placeholder }) => {
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.userReducer.theme);
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
          className="searchInput"
          value={inputValue ? inputValue : ""}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            placeholder
              ? `${placeholder}`
              : "Keyword, hashtag, pubkey or post ID"
          }
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
          onKeyDown={searchHandleByEnter}
        />
        {isLoading && (
          <div className="loader">
            <Spinner size="sm" animation="border" color="var(--body-color)" />
          </div>
        )}

        <div
          id="dropdown-basic"
          style={{ borderColor: theme === "dark" ? "white" : "#6c757d" }}
        >
          <Form.Select
            className="seachSelect"
            color="white"
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
          variant={theme === "dark" ? "light" : "outline-secondary"}
          onClick={searchHandle}
        >
          <SearchIcon
            color={theme === "dark" ? "var(--body-color)" : "black"}
          />
        </Button>
      </InputGroup>
    </>
  );
};

export default Search;
