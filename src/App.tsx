import { RouterProvider } from "react-router-dom";
import Store from "./store";

import "./App.css";
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
