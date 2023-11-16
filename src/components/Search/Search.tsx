import "./Search.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Button } from "react-bootstrap";
import { Search as SearchIcon, Sliders } from "react-bootstrap-icons";
import Spinner from "react-bootstrap/Spinner";
import { FC, useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  createSearchParams,
} from "react-router-dom";
import React from "react";
import { useAppSelector } from "../../hooks/redux";
import DatePicker from "react-datepicker";
import { formatDate } from "../../utils/formatDate";

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
  const [allSearch, setAllSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [following, setFollowing] = useState("");
  const [lang, setLang] = useState("");
  const [lna, setLna] = useState("");
  const [nip05, setNip05] = useState("");
  const [isSpam, setIsSpam] = useState(false);
  const [tags, setTags] = useState("");
  const [resultQuery, setResultQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [sinceDate, setSinceDate] = useState<Date | null>(null);
  const [isAdvanced, setIsAdvanced] = useState(
    searchParams.get("advanced") === "true" ? true : false
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tagsWithHash = tags
      .split(" ")
      .map((tag) => "#" + tag)
      .join(" ");
    setResultQuery(
      `${allSearch ? allSearch + " " : ""}${
        author ? "by:" + author + " " : ""
      }${following ? "following:" + following + " " : ""}${
        lang ? "lang:" + lang + " " : ""
      }${lna ? "lna:" + lna + " " : ""}${nip05 ? "nip05:" + nip05 + " " : ""}${
        tags ? tagsWithHash + " " : ""
      }${sinceDate ? "since:" + formatDate(sinceDate!) + " " : ""}${
        startDate ? "until:" + formatDate(startDate!) + " " : ""
      }${isSpam ? "-filter:spam" : ""}`
    );
  }, [
    allSearch,
    author,
    following,
    lang,
    lna,
    nip05,
    isSpam,
    tags,
    sinceDate,
    startDate,
  ]);

  const openAdvanced = () => {
    setIsAdvanced(true);
    if (inputValue) {
      const search = inputValue;
      const since = search?.match(/since:\d{4}-\d{2}-\d{2}/)
        ? new Date(search?.match(/since:\d{4}-\d{2}-\d{2}/)![0])
        : "";
      const until = search?.match(/until:\d{4}-\d{2}-\d{2}/)
        ? new Date(search?.match(/until:\d{4}-\d{2}-\d{2}/)![0])
        : "";
      if (since) {
        setSinceDate(since);
      }
      if (until) {
        setStartDate(until);
      }
      const tagsWithHash = search
        ?.split(" ")
        .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
      const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
      if (tags) {
        setTags(tags.join(" "));
      }
      let cleanSearch = "";

      if (search.includes("following:")) {
        const followingNpub = search?.match(/npub[0-9a-zA-Z]+/g)
          ? search?.match(/npub[0-9a-zA-Z]+/g)![0]
          : "";
        if (followingNpub) {
          setFollowing(followingNpub);
        }
        cleanSearch = search
          ?.split(" ")
          .filter((str) => !str.match(/following:npub[0-9a-zA-Z]+/g))
          .join(" ")
          .replace(/#[a-zA-Z0-9_]+/g, "")
          .replace(/since:\d{4}-\d{2}-\d{2}/, "")
          .replace(/until:\d{4}-\d{2}-\d{2}/, "");
      } else if (search.includes("by:")) {
        const byNpub = search?.match(/npub[0-9a-zA-Z]+/g)
          ? search?.match(/npub[0-9a-zA-Z]+/g)![0]
          : "";
        if (byNpub) {
          setAuthor(byNpub);
        }
        cleanSearch = search
          ?.split(" ")
          .filter((str) => !str.match(/by:npub[0-9a-zA-Z]+/g))
          .join(" ")
          .replace(/#[a-zA-Z0-9_]+/g, "")
          .replace(/since:\d{4}-\d{2}-\d{2}/, "")
          .replace(/until:\d{4}-\d{2}-\d{2}/, "");
      } else {
        cleanSearch = search
          .replace(/#[a-zA-Z0-9_]+/g, "")
          .replace(/since:\d{4}-\d{2}-\d{2}/, "")
          .replace(/until:\d{4}-\d{2}-\d{2}/, "");
      }
      setAllSearch(cleanSearch.trimStart().trimEnd());
    }
  };

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

  const searchAdvanceHandle = () => {
    setIsAdvanced(false);
    navigate({
      pathname: "/",
      search: resultQuery
        ? createSearchParams({ q: resultQuery }).toString()
        : "",
    });
  };

  const theDayBeforeStartDate = new Date(startDate ?? "");
  const theDayAfterSinceDate = new Date(sinceDate ?? "");

  return (
    <>
      {isAdvanced ? (
        <div className="searchAdvanced">
          <h4>Advanced search</h4>
          <Form>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <InputGroup>
                <Form.Control
                  value={allSearch}
                  onChange={(e) => setAllSearch(e.target.value)}
                  className="searchInput"
                  type="text"
                  placeholder="All of these words"
                />
              </InputGroup>

              <Form.Label>
                Example: nostr relays - Contains both "nostr" and "relays"
              </Form.Label>
            </Form.Group>
            <div className="datePicker">
              <div className="date-picker-wrapper">
                <p>Since: </p>
                <DatePicker
                  placeholderText="20xx-mm-dd"
                  className="datePickerInput"
                  selected={sinceDate}
                  onChange={setSinceDate}
                  dateFormat="yyyy-MM-dd"
                  maxDate={
                    startDate !== null
                      ? theDayBeforeStartDate.setDate(startDate.getDate() - 1)
                      : new Date()
                  }
                  minDate={new Date("2023-01-01")}
                />
              </div>
              <div className="date-picker-wrapper">
                <p>Until: </p>
                <DatePicker
                  placeholderText={formatDate(new Date())}
                  className="datePickerInput"
                  selected={startDate}
                  onChange={setStartDate}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  minDate={
                    sinceDate !== null
                      ? theDayAfterSinceDate.setDate(sinceDate.getDate() + 1)
                      : new Date("2023-01-01")
                  }
                />
              </div>
            </div>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="searchInput"
                type="text"
                placeholder="Hashtags"
              />
              <Form.Label>Example: bitcoin</Form.Label>
            </Form.Group>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                disabled={following ? true : false}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="searchInput"
                type="text"
                placeholder={
                  following ? "Not compatible with Following filter." : "Author"
                }
              />
              <Form.Label>
                Example: npub1xxx - Only posts by npub1xxx
              </Form.Label>
            </Form.Group>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                disabled={author ? true : false}
                value={following}
                onChange={(e) => setFollowing(e.target.value)}
                className="searchInput"
                type="text"
                placeholder={
                  author ? "Not compatible with Author filter." : "Following"
                }
              />
              <Form.Label>
                Example: npub1xxx - Only posts by profiles that npub1xxx is
                following
              </Form.Label>
            </Form.Group>
            {/* <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="searchInput"
                type="text"
                placeholder="Language"
              />
              <Form.Label>Example: en - Only posts in English</Form.Label>
            </Form.Group> */}
            {/* <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                value={lna}
                onChange={(e) => setLna(e.target.value)}
                className="searchInput"
                type="text"
                placeholder="LN Address"
              />
              <Form.Label>
                Example: me@getalby.com @walletofsatoshi.com - Contains
                me@getalby.com or @walletofsatoshi.com
              </Form.Label>
            </Form.Group> */}
            {/* <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                value={nip05}
                onChange={(e) => setNip05(e.target.value)}
                className="searchInput"
                type="text"
                placeholder="NIP-05 identifier"
              />
              <Form.Label>
                Example: some@stacker.news @nostr.band - Contains
                some@stacker.news or @nostr.band
              </Form.Label>
            </Form.Group> */}
            <Form.Check // prettier-ignore
              type="switch"
              id="custom-switch"
              value={`${isSpam}`}
              onChange={(e) => setIsSpam(e.target.checked)}
              label="Include low-quality content (spam)"
              className="searchInput"
            />
            <Form.Group
              className="mb-3 mt-2"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Control
                readOnly
                value={resultQuery}
                className="searchInput"
                type="text"
                placeholder="Your query"
              />
              <Form.Label>
                This is the final query for your advanced search
              </Form.Label>
            </Form.Group>

            <Button onClick={searchAdvanceHandle} variant="outline-primary">
              Search
            </Button>
            <Button
              variant="outline-secondary"
              style={{ marginLeft: ".5rem" }}
              onClick={() => {
                navigate("/");
                setIsAdvanced(false);
              }}
            >
              Cancel
            </Button>
          </Form>
        </div>
      ) : (
        <InputGroup className="mb-3" id="search-input">
          <Form.Control
            className="searchInput"
            value={inputValue ? inputValue : ""}
            ref={inputRef}
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
            style={{
              float: "right",
              borderRadius: "0",
              fontSize: ".8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="advancedBtn"
            variant="outline-secondary"
            onClick={openAdvanced}
          >
            <Sliders />
          </Button>
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
      )}
    </>
  );
};

export default Search;
