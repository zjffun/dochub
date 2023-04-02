import { RouterProvider } from "react-router-dom";
import router from "./router";
import Store from "./store";

import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Store>
      <div className="App">
        <RouterProvider router={router} />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Store>
  );
}

export default App;
