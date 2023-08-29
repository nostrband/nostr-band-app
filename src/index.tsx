import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
//@ts-ignore
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import { Provider } from "react-redux";
//@ts-ignore
import { setupStore } from "./store/store.ts";

const store = setupStore();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </>
);
