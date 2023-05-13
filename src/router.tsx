import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./components/Loading";
import TopDocList from "./pages/TopDocList";

const CreateDoc = lazy(() => import("./pages/CreateDoc"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const DocList = lazy(() => import("./pages/DocList"));
const TranslateDoc = lazy(() => import("./pages/TranslateDoc"));
const UserHomeOverview = lazy(() => import("./pages/UserHome/Overview"));
const UserHomeDocuments = lazy(() => import("./pages/UserHome/Documents"));
const UserHomeRecentlyDeleted = lazy(
  () => import("./pages/UserHome/RecentlyDeleted")
);

const router = createBrowserRouter([
  {
    id: "home",
    path: "/",
    element: <TopDocList></TopDocList>,
  },
  {
    id: "admin",
    path: "/admin",
    children: [],
  },
  {
    id: "user",
    path: "/user",
    children: [
      {
        id: "user-home-recently-deleted",
        path: ":login/recently-deleted",
        element: (
          <React.Suspense fallback={<Loading loading={true}></Loading>}>
            <UserHomeRecentlyDeleted></UserHomeRecentlyDeleted>
          </React.Suspense>
        ),
      },
      {
        id: "user-home-documents",
        path: ":login/documents",
        element: (
          <React.Suspense fallback={<Loading loading={true}></Loading>}>
            <UserHomeDocuments></UserHomeDocuments>
          </React.Suspense>
        ),
      },
      {
        id: "user-home-overview",
        path: ":login",
        element: (
          <React.Suspense fallback={<Loading loading={true}></Loading>}>
            {/* TODO: implement overview */}
            {/* <UserHomeOverview></UserHomeOverview> */}
            <UserHomeDocuments></UserHomeDocuments>
          </React.Suspense>
        ),
      },
    ],
  },
  {
    id: "new",
    path: "/new/*",
    element: (
      <React.Suspense fallback={<Loading loading={true}></Loading>}>
        <CreateDoc></CreateDoc>
      </React.Suspense>
    ),
  },
  {
    id: "new-project",
    path: "/new-project",
    element: (
      <React.Suspense fallback={<Loading loading={true}></Loading>}>
        <CreateProject></CreateProject>
      </React.Suspense>
    ),
  },
  {
    id: "preview",
    path: "/preview/*",
    element: (
      <React.Suspense fallback={<Loading loading={true}></Loading>}>
        <TranslateDoc></TranslateDoc>
      </React.Suspense>
    ),
  },
  {
    id: "translate",
    path: "/translate/*",
    element: (
      <React.Suspense fallback={<Loading loading={true}></Loading>}>
        <TranslateDoc></TranslateDoc>
      </React.Suspense>
    ),
  },
  {
    id: "doc",
    path: "/*",
    element: (
      <React.Suspense fallback={<Loading loading={true}></Loading>}>
        <DocList></DocList>
      </React.Suspense>
    ),
  },
]);

export default router;
