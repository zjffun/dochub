import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useLocation } from "react-router";
import { getDocs } from "../api";
import DocHeader from "../components/DocHeader";
import DocItem from "../components/DocItem";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { IDoc } from "../types";

import "./DocList.scss";

const pageSize = 20;

function DocList() {
  const location = useLocation();
  const [list, setList] = useState<IDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

  const pathname = location.pathname;

  function handlePageClick({ selected }: { selected: number }) {
    getList({
      forcePage: selected,
      pathname,
    });
  }

  function getList({
    forcePage,
    pathname,
  }: {
    forcePage: number;
    pathname: string;
  }) {
    setLoading(true);

    getDocs({
      page: forcePage + 1,
      pageSize,
      path: pathname,
      depth: 999,
    })
      .then((data) => {
        if (Array.isArray(data.list)) {
          setList(data.list);
        } else {
          setList([]);
        }

        if (data.total) {
          setTotal(data.total);
        } else {
          setTotal(0);
        }

        setForcePage(forcePage);
        window.scrollTo(0, 0);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getList({
      forcePage: 0,
      pathname,
    });
  }, [pathname]);

  return (
    <>
      <Header></Header>
      <DocHeader></DocHeader>
      <div className="dochub-doc-list">
        {total > 0 && (
          <ul className="dochub-doc-list__ul">
            {list.map((item) => {
              return (
                <li className="dochub-doc-list__ul__li">
                  <DocItem
                    key={item.path}
                    path={item.path}
                    originalLineNum={item.originalLineNum}
                    translatedLineNum={item.translatedLineNum}
                    consistentLineNum={item.consistentLineNum}
                  ></DocItem>
                </li>
              );
            })}
          </ul>
        )}
        {total === 0 && (
          <div className="dochub-doc-list__empty">
            No results matched your search.
          </div>
        )}
        {total > pageSize && (
          <div className="dochub-doc-list__pagination">
            <ReactPaginate
              className=""
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              forcePage={forcePage}
              pageCount={Math.ceil(total / pageSize)}
              previousLabel="< previous"
              renderOnZeroPageCount={() => null}
            />
          </div>
        )}
        <Loading loading={loading}></Loading>
      </div>
    </>
  );
}

export default DocList;
