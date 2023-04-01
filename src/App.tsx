import { RouterProvider } from "react-router-dom";
import router from "./router";
import Store from "./store";

import "./App.scss";

function App() {
  return (
    <Store>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </Store>
  );
}

export default App;
