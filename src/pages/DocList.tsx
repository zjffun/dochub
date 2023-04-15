import classnames from "classnames";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import DocHeader from "../components/DocHeader";
import DocList from "../components/DocList";
import Header from "../components/Header";

import "./DocList.scss";

function DocListPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const pathname = location.pathname;
  const search = location.search;
  const urlSearchParams = new URLSearchParams(search);
  const q = urlSearchParams.get("q") || "";
  const isDelete = /( |^)is:delete( |$)/.test(q);

  return (
    <>
      <Header></Header>
      <DocHeader pathname={pathname}></DocHeader>
      <ul className="dochub-page-doc-list__nav nav">
        <li
          className={classnames("nav__item", {
            "nav__item--active": !isDelete,
          })}
          onClick={() => {
            navigate({
              search: ``,
            });
          }}
        >
          Documents
        </li>
        <li
          className={classnames("nav__item", {
            "nav__item--active": isDelete,
          })}
          onClick={() => {
            navigate({
              search: `?q=is:delete`,
            });
          }}
        >
          Recently Deleted
        </li>
      </ul>
      <DocList pathname={pathname} isDelete={isDelete}></DocList>
    </>
  );
}

export default DocListPage;
