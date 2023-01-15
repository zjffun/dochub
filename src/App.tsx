import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import DocumentList from "./pages/DocumentList";

const RelationList = lazy(() => import("./pages/RelationList"));
const RelationPage = lazy(() => import("./pages/RelationPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <DocumentList></DocumentList>,
  },
  {
    path: "/doc/:nameId",
    element: (
      <React.Suspense fallback={<>...</>}>
        <RelationList></RelationList>
      </React.Suspense>
    ),
  },
  {
    path: "/relation/:nameId",
    element: (
      <React.Suspense fallback={<>...</>}>
        <RelationPage></RelationPage>
      </React.Suspense>
    ),
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
