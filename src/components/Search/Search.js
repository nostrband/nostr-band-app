import "./Search.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import { Button } from "react-bootstrap";
import { Search as SearchIcon } from "react-bootstrap-icons";
import Spinner from "react-bootstrap/Spinner";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Search = ({ isLoading }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("q") ? searchParams.get("q") : ""
  );

  const searchHandle = () => {
    navigate(`/?q=${inputValue}`);
  };

  return (
    <>
      <InputGroup className="mb-3" id="search-input">
        <Form.Control
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Keyword, hashtag, pubkey or post ID"
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
        />
        {isLoading && (
          <div className="loader">
            <Spinner size="sm" animation="border" />
          </div>
        )}

        <Dropdown className="search-dropdown">
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            All
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">All</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Posts</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Profiles</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Zaps</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button
          className="btn"
          id="search-btn"
          variant="secondary"
          onClick={() => searchHandle()}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </>
  );
};

export default Search;
