import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import DocumentList from "./pages/DocumentList";

const RelationList = lazy(() => import("./pages/RelationList"));
const RelationPage = lazy(() => import("./pages/RelationPage"));

// admin
const AdminCollections = lazy(() => import("./pages/admin/CollectionsPage"));
const AdminLogin = lazy(() => import("./pages/admin/LoginPage"));

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
  {
    path: "/admin",
    children: [
      {
        path: "login",
        element: (
          <React.Suspense fallback={<>...</>}>
            <AdminLogin></AdminLogin>
          </React.Suspense>
        ),
      },
      {
        path: "collections",
        element: (
          <React.Suspense fallback={<>...</>}>
            <AdminCollections></AdminCollections>
          </React.Suspense>
        ),
      },
    ],
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
