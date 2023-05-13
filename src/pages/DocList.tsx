import classnames from "classnames";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import DocHeader from "../components/DocHeader";
import DocList from "../components/DocList";
import Header from "../components/Header";
import usePermissions from "../hooks/usePermissions";
import { useStoreContext } from "../store";

import "./DocList.scss";

function DocListPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const docPath = location.pathname;
  const search = location.search;
  const urlSearchParams = new URLSearchParams(search);
  const q = urlSearchParams.get("q") || "";
  const isDelete = /( |^)is:delete( |$)/.test(q);

  const { setHasWritePermission } = useStoreContext();
  const { hasWritePermission } = usePermissions(docPath);

  useEffect(() => {
    setHasWritePermission(hasWritePermission);
  }, [setHasWritePermission, hasWritePermission]);

  return (
    <>
      <Header></Header>
      <DocHeader docPath={docPath}></DocHeader>
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
        {hasWritePermission && (
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
        )}
      </ul>
      <DocList docPath={docPath} isDelete={isDelete}></DocList>
    </>
  );
}

export default DocListPage;
