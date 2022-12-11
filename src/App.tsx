import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import DocumentList from "./pages/DocumentList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DocumentList></DocumentList>,
  },
  {
    path: "/aa",
    element: <div>Hello world!aa</div>,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
