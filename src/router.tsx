import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import TopDocList from "./pages/TopDocList";

const CreateDoc = lazy(() => import("./pages/CreateDoc"));
const DocList = lazy(() => import("./pages/DocList"));
const RelationPage = lazy(() => import("./pages/RelationPage"));
const UserHome = lazy(() => import("./pages/UserHome"));

// admin
const AdminCollections = lazy(() => import("./pages/admin/CollectionsPage"));
const AdminLogin = lazy(() => import("./pages/admin/LoginPage"));

const router = createBrowserRouter([
  {
    id: "home",
    path: "/",
    element: <TopDocList></TopDocList>,
  },
  {
    id: "admin",
    path: "/admin",
    children: [
      {
        id: "admin-login",
        path: "login",
        element: (
          <React.Suspense fallback={<>...</>}>
            <AdminLogin></AdminLogin>
          </React.Suspense>
        ),
      },
      {
        id: "admin-collection",
        path: "collection",
        element: (
          <React.Suspense fallback={<>...</>}>
            <AdminCollections></AdminCollections>
          </React.Suspense>
        ),
      },
    ],
  },
  {
    id: "user",
    path: "/user",
    children: [
      {
        id: "user-home",
        path: ":login",
        element: (
          <React.Suspense fallback={<>...</>}>
            <UserHome></UserHome>
          </React.Suspense>
        ),
      },
    ],
  },
  {
    id: "new",
    path: "/new/*",
    element: (
      <React.Suspense fallback={<>...</>}>
        <CreateDoc></CreateDoc>
      </React.Suspense>
    ),
  },
  {
    id: "preview",
    path: "/preview/*",
    element: (
      <React.Suspense fallback={<>...</>}>
        <RelationPage></RelationPage>
      </React.Suspense>
    ),
  },
  {
    id: "translate",
    path: "/translate/*",
    element: (
      <React.Suspense fallback={<>...</>}>
        <RelationPage></RelationPage>
      </React.Suspense>
    ),
  },
  {
    id: "doc",
    path: "/*",
    element: (
      <React.Suspense fallback={<>...</>}>
        <DocList></DocList>
      </React.Suspense>
    ),
  },
]);

export default router;