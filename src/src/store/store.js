import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserSlice";

const rootReducer = combineReducers({
  userReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools: true,
  });
};
