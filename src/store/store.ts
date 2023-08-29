import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import userReducer from "./reducers/UserSlice";

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});

const rootReducer = combineReducers({
  userReducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools: true,
    middleware: customizedMiddleware,
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
