import "./Search.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Button, Dropdown } from "react-bootstrap";
import { Check, Search as SearchIcon, Sliders } from "react-bootstrap-icons";
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
import TagInput from "../TagInput/TagInput";
import { DEFAULT_KINDS, getKindName } from "../../utils/helper";

type searchTypes = {
  isLoading: boolean;
  placeholder?: string;
};

type tagType = {
  value: number;
  label: string;
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
  const [isValidAuthor, setIsValidAuthor] = useState(true);
  const [isValidFollowing, setIsValidFollowing] = useState(true);
  const [newTags, setNewTags] = useState<tagType[]>([]);
  const [langs, setLangs] = useState<tagType[]>([]);
  const [kinds, setKinds] = useState<tagType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const store = useAppSelector((store) => store.userReducer);

  const hashtagsSuggestions = [
    {
      value: 1,
      label: "bitcoin",
    },
    {
      value: 2,
      label: "nostr",
    },
    {
      value: 3,
      label: "life",
    },
  ];

  const langsSuggestions = [
    {
      value: 1,
      label: "en",
    },
    {
      value: 2,
      label: "ru",
    },
    {
      value: 3,
      label: "fr",
    },
    {
      value: 4,
      label: "us",
    },
  ];

  const kindsSuggestions = DEFAULT_KINDS.map(k => ({
    label: `${getKindName(k)} (${k})`,
    value: k
  }));
  // [
  //   {
  //     value: 1,
  //     label: "Profiles",
  //   },
  //   {
  //     value: 2,
  //     label: "Posts",
  //   },
  //   {
  //     value: 3,
  //     label: "Zaps",
  //   },
  // ];

  const languages = ["en", "es", "de", "fr", "ru"];

  useEffect(() => {
    setInputValue(searchParams.get("q"));
  }, [searchParams.get("q")]);

  const authorBlur = () => {
    const isValidNpub = author.match(/npub[0-9a-zA-Z]{59}$/g);
    if (isValidNpub || !author) {
      setIsValidAuthor(true);
    } else {
      setIsValidAuthor(false);
    }
  };

  const followingBlur = () => {
    const isValidNpub = following.match(/npub[0-9a-zA-Z]{59}$/g);
    if (isValidNpub || !following) {
      setIsValidFollowing(true);
    } else {
      setIsValidFollowing(false);
    }
  };

  useEffect(() => {
    const tagsWithHash = newTags.map((tag) => "#" + tag.label).join(" ");
    const kindsNumbers = kinds
      .map((kind) => "kind:" + kind.value)
      .join(" ");

    setResultQuery(
      `${allSearch ? allSearch + " " : ""}${
        author && isValidAuthor ? "by:" + author + " " : ""
      }${following && isValidFollowing ? "following:" + following + " " : ""}${
        langs ? langs.map((lang) => "lang:" + lang.label).join(" ") + " " : ""
      }${lna ? "lna:" + lna + " " : ""}${nip05 ? "nip05:" + nip05 + " " : ""}${
        newTags ? tagsWithHash + " " : ""
      }${kinds ? kindsNumbers + " " : ""}${
        sinceDate
          ? "since:" +
            formatDate(
              new Date(
                Date.UTC(
                  sinceDate.getFullYear(),
                  sinceDate.getMonth(),
                  sinceDate.getDate()
                )
              )
            ) +
            " "
          : ""
      }${
        startDate
          ? "until:" +
            formatDate(
              new Date(
                Date.UTC(
                  startDate.getFullYear(),
                  startDate.getMonth(),
                  startDate.getDate()
                )
              )
            ) +
            " "
          : ""
      }${isSpam ? "-filter:spam" : ""}`.trim()
    );
  }, [
    allSearch,
    author,
    following,
    lang,
    lna,
    nip05,
    isSpam,
    newTags,
    sinceDate,
    startDate,
    isValidFollowing,
    isValidAuthor,
    langs,
    kinds,
  ]);

  useEffect(() => {
    if (resultQuery) {
      setInputValue(resultQuery);
    }
  }, [resultQuery]);

  const openAdvanced = () => {
    setIsAdvanced(true);
    if (inputValue) {
      const search = inputValue;
      const since = search?.match(/since:\d{4}-\d{2}-\d{2}/)
        ? new Date(
            search?.match(/since:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
          )
        : "";
      const until = search?.match(/until:\d{4}-\d{2}-\d{2}/)
        ? new Date(
            search?.match(/until:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
          )
        : "";
      if (since instanceof Date) {
        if (since < until || !until) {
          setSinceDate(since);
        }
      }
      if (until instanceof Date) {
        if (!since || until > since) {
          setStartDate(until);
        }
      }
      const tagsWithHash = search
        ?.split(" ")
        .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
      const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
      if (tags) {
        const newTags: tagType[] = tags.map((tag, i) => {
          return { value: i, label: tag };
        });
        setNewTags(newTags);
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

  const handleLanguage = (lang: string) => {
    if (allSearch.includes(`lang:${lang}`)) {
      setAllSearch((prevState) => prevState.replace(`lang:${lang}`, ""));
    } else {
      setAllSearch((prevState) =>
        prevState.concat(` lang:${lang}`).trimStart()
      );
    }
  };

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
                <DatePicker
                  placeholderText="Since"
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
              <div
                className="date-picker-wrapper"
                style={{ marginLeft: ".3rem" }}
              >
                <DatePicker
                  placeholderText={"Until"}
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
            <Form.Label>Specify a range of dates</Form.Label>

            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              {/* <Form.Control
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="searchInput"
                type="text"
                placeholder="Hashtags"
              /> */}
              <TagInput
                suggestions={hashtagsSuggestions}
                tags={newTags}
                placeholder="Hashtag"
                setTags={setNewTags}
              />
              <Form.Label>Example: bitcoin</Form.Label>
            </Form.Group>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                onBlur={authorBlur}
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
                Example: npub1xxx - Only posts by npub1xxx{" "}
                {!isValidAuthor && (
                  <span style={{ color: "red" }}>*Invalid npub</span>
                )}
              </Form.Label>
            </Form.Group>

            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <Form.Control
                disabled={author ? true : false}
                value={following}
                onBlur={followingBlur}
                onChange={(e) => setFollowing(e.target.value)}
                className="searchInput"
                type="text"
                placeholder={
                  author ? "Not compatible with Author filter." : "Following"
                }
              />
              <Form.Label>
                Example: npub1xxx - Only posts by profiles that npub1xxx is
                following{" "}
                {!isValidFollowing && (
                  <span style={{ color: "red" }}>*Invalid npub</span>
                )}
              </Form.Label>
            </Form.Group>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <TagInput
                suggestions={langsSuggestions}
                placeholder="Language"
                tags={langs}
                setTags={setLangs}
              />
              <Form.Label>Example: en</Form.Label>
            </Form.Group>
            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
              <TagInput
                suggestions={kindsSuggestions}
                placeholder="Kind"
                tags={kinds}
                setTags={setKinds}
              />
              <Form.Label>Example: profiles, posts</Form.Label>
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
            {/* <Dropdown style={{ marginBottom: ".2rem" }}>
              <Dropdown.Toggle variant="outline-secondary">
                language
              </Dropdown.Toggle>

              <Dropdown.Menu
                variant={store.theme === "dark" ? "dark" : "light"}
              >
                {languages.map((lang, index) => {
                  return (
                    <Dropdown.Item
                      key={index}
                      onClick={() => handleLanguage(lang)}
                    >
                      {lang} {allSearch.includes(`lang:${lang}`) && <Check />}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown> */}
            {/* <div style={{color: "var(--body-color)"}}>
              Language: {languages.map(lang => {
                const isLangSelected = resultQuery.includes(`lang:${lang}`);
                console.log(isLangSelected);
                
                return isLangSelected ? <Button style={{margin: ".1rem"}} size="sm" variant="outline-primary">
                  {lang}
                </Button> : <Button size="sm" style={{margin: ".1rem"}} variant="outline-secondary">
                  {lang}
                </Button>
              })}
            </div> */}
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

          {/* <div
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
          </div> */}

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
