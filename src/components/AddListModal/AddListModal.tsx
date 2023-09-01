import { FC, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import ReactModal from "react-modal";
import cl from "./AddListModal.module.css";
import Form from "react-bootstrap/Form";
import { useAppSelector } from "../../hooks/redux";
import { getAllTags } from "../../utils/getTags";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import { profileType } from "../../types/types";
import UserIcon from "../../assets/user.png";

type addListTypes = {
  isModal: boolean;
  setIsModal: (a: boolean) => void;
  selectedProfile?: profileType;
};

const AddListModal: FC<addListTypes> = ({
  isModal,
  setIsModal,
  selectedProfile,
}) => {
  const [selectedList, setSelectedList] = useState("newList");
  const store = useAppSelector((store) => store.userReducer);
  const closeModal = (): void => setIsModal(false);
  const allTags = store.lists;

  console.log(selectedProfile);

  return (
    <ReactModal
      isOpen={isModal}
      onAfterOpen={() => {
        document.body.style.overflow = "hidden";
      }}
      onAfterClose={() => {
        document.body.style.overflow = "auto";
      }}
      onRequestClose={closeModal}
      ariaHideApp={false}
      className={cl.addListModal}
      style={{ overlay: { zIndex: 6 } }}
    >
      <div className={cl.modalHeader}>
        <h4>Add to list</h4>
        <Button
          variant="link"
          style={{ fontSize: "1.8rem", color: "black" }}
          onClick={closeModal}
        >
          <X />
        </Button>
      </div>
      <hr />
      <div style={{ marginBottom: ".8rem" }}>
        <Form.Label htmlFor="select-list">
          <strong>Select list:</strong>
        </Form.Label>
        <Form.Select
          id="select-list"
          aria-label="Default select example"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <option value="newList">+ New List</option>
          {allTags &&
            store.isAuth &&
            allTags.map((tags, index) => {
              const listLabel = getAllTags(tags, "name").flat();

              return <option key={index}>{listLabel[1]}</option>;
            })}
        </Form.Select>
      </div>
      {selectedList === "newList" ? (
        <>
          <Form.Label htmlFor="inputListName">
            <strong>List name:</strong>
          </Form.Label>
          <Form.Control
            type="text"
            id="inputListName"
            placeholder="Enter List Name"
          />
        </>
      ) : (
        ""
      )}
      <p style={{ margin: ".8rem 0 .2rem 0" }}>
        <strong>Profiles:</strong>
      </p>
      <div className={cl.modalBody}>
        {selectedProfile ? (
          <div className={cl.selectedProfile}>
            <div className={cl.selectedProfileHeader}>
              <div className={cl.selectedProfileImage}>
                <img
                  src={selectedProfile.image}
                  onError={({ currentTarget }) => {
                    currentTarget.srcset = UserIcon;
                  }}
                />
              </div>
              <p className={cl.selectedProfileName}>
                {selectedProfile.display_name
                  ? selectedProfile.display_name
                  : selectedProfile.name}
              </p>
            </div>
            <div>
              <MarkdownComponent
                content={selectedProfile.about ? selectedProfile.about : ""}
              />
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <hr />
      <div className={cl.modalControls}>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="success">Add</Button>
      </div>
    </ReactModal>
  );
};

export default AddListModal;
