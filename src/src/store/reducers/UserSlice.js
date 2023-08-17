import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuth: localStorage.getItem("login") ? true : false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsAuth(state, action) {
      state = { ...state, isAuth: action.payload };
      return state;
    },
  },
});

export default userSlice.reducer;
