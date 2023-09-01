import { createSlice } from "@reduxjs/toolkit";
import { profileType } from "../../types/types";
import { NDKTag } from "@nostrband/ndk";

interface IUserState {
  isAuth: boolean;
  contacts: profileType;
  lists: NDKTag[][];
}

const initialState: IUserState = {
  isAuth: localStorage.getItem("login") ? true : false,
  contacts: {},
  lists: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsAuth(state, action) {
      state = { ...state, isAuth: action.payload };
      return state;
    },
    setContacts(state, action) {
      state = { ...state, contacts: action.payload };
      return state;
    },
    setLists(state, action) {
      state = { ...state, lists: action.payload };
      return state;
    },
  },
});

export default userSlice.reducer;
