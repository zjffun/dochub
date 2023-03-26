import { RouterProvider } from "react-router-dom";
import Store from "./store";

import "./App.scss";
import router from "./router";

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
