import { createSlice } from "@reduxjs/toolkit";
import { profileType } from "../../types/types";
import { NDKEvent } from "@nostrband/ndk";

interface IUserState {
  isAuth: boolean;
  contacts: profileType;
  lists: NDKEvent[];
  labels: NDKEvent[];
  user: profileType;
  theme: string;
}

const initialState: IUserState = {
  isAuth: localStorage.getItem("login") ? true : false,
  contacts: {},
  lists: [],
  labels: [],
  user: {},
  theme: localStorage.getItem("theme") ?? "light",
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
    setLabels(state, action) {
      state = { ...state, labels: action.payload };
      return state;
    },
    setUser(state, action) {
      state = { ...state, user: action.payload };
      return state;
    },
    setTheme(state, action) {
      state = { ...state, theme: action.payload };
      return state;
    },
  },
});

export default userSlice.reducer;
