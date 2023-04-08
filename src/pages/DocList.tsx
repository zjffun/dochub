import { useLocation } from "react-router";
import DocHeader from "../components/DocHeader";
import DocList from "../components/DocList";
import Header from "../components/Header";

import "./DocList.scss";

function DocListPage() {
  const location = useLocation();

  const pathname = location.pathname;

  return (
    <>
      <Header></Header>
      <DocHeader></DocHeader>
      <DocList pathname={pathname}></DocList>
    </>
  );
}

export default DocListPage;
