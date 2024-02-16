import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import { Provider } from "react-redux";
import { setupStore } from "./store/store";
import "react-datepicker/dist/react-datepicker.css";
import "react-tagsinput/react-tagsinput.css";
import { init as initNostrLogin } from "nostr-login"

initNostrLogin({
  bunkers: "nsec.app"
})

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
