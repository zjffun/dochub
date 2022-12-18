import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import DocumentList from "./pages/DocumentList";
import RelationList from "./pages/RelationList";
import RelationPage from "./pages/RelationPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DocumentList></DocumentList>,
  },
  {
    path: "/doc/:id",
    element: <RelationList></RelationList>,
  },
  {
    path: "/relation/:id",
    element: <RelationPage></RelationPage>,
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
