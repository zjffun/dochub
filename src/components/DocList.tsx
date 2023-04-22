import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { getDocs } from "../api";
import DocItem from "../components/DocItem";
import Loading from "../components/Loading";
import useCurrentRef from "../hooks/useCurrentRef";
import { IDoc } from "../types";

import "./DocList.scss";

const pageSize = 20;

function DocList({
  pathname,
  isDelete,
}: {
  pathname: string;
  isDelete?: boolean;
}) {
  const [list, setList] = useState<IDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

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
      isDelete,
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
      .catch(() => {
        setList([]);
        setTotal(0);
        setForcePage(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const currentRef = useCurrentRef<{
    getList: typeof getList;
    pathname: typeof pathname;
  }>({
    getList,
    pathname,
  });

  useEffect(() => {
    currentRef.current.getList({
      forcePage: 0,
      pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isDelete]);

  return (
    <>
      <div className="dochub-component-doc-list">
        {total > 0 && (
          <ul className="dochub-component-doc-list__ul">
            {list.map((item) => {
              return (
                <li
                  key={item.path}
                  className="dochub-component-doc-list__ul__li"
                >
                  <DocItem
                    key={item.path}
                    path={item.path}
                    originalLineNum={item.originalLineNum}
                    translatedLineNum={item.translatedLineNum}
                    consistentLineNum={item.consistentLineNum}
                    isDelete={isDelete}
                    onDeleteDoc={() => {
                      getList({
                        forcePage: 0,
                        pathname,
                      });
                    }}
                  ></DocItem>
                </li>
              );
            })}
          </ul>
        )}
        {total === 0 && (
          <div className="dochub-component-doc-list__empty">
            No results matched your search.
          </div>
        )}
        {total > pageSize && (
          <div className="dochub-component-doc-list__pagination">
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
