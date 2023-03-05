import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { getDocs } from "../api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useStoreContext } from "../store";
import { IDoc } from "../types";
import { getConsistentPercent, getTranslatedPercent } from "../utils/progress";

import "./DocList.scss";

const pageSize = 20;

function RelationList() {
  const pathname = window.location.pathname;

  const { userInfo } = useStoreContext();

  const [list, setList] = useState<IDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

  function getTranslateLink(path: string) {
    if (userInfo?.login) {
      return `/translate${path}`;
    }

    return `/preview${path}`;
  }

  function handlePageClick(data: any) {
    setForcePage(data.selected);
  }

  useEffect(() => {
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [forcePage, pathname]);

  return (
    <>
      <Header></Header>
      <div className="dochub-doc-list-container">
        <div className="dochub-doc-list-navigation">
          <div
            style={{
              flex: "1 1 auto",
            }}
          ></div>
          <Link to={`/new${pathname}`}>Add doc</Link>
        </div>
        <table className="dochub-doc-list-table">
          <thead>
            <tr className="dochub-doc-list-table__header">
              <th className="dochub-doc-list-table__th">#</th>
              <th className="dochub-doc-list-table__th">Name</th>
              <th className="dochub-doc-list-table__th">Original</th>
              <th className="dochub-doc-list-table__th">Translated</th>
              <th className="dochub-doc-list-table__th">Consistent</th>
              <th className="dochub-doc-list-table__th"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => {
              return (
                <tr className="dochub-doc-list-table__tr" key={item.path}>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__id">
                    {forcePage * pageSize + i + 1}
                  </td>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__name">
                    {item.path}
                  </td>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__original">
                    <p>{item.originalLineNum} lines</p>
                  </td>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__translated">
                    <p>{getTranslatedPercent(item)}%</p>
                    <p>{item.translatedLineNum} lines</p>
                  </td>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__consistent">
                    <p>{getConsistentPercent(item)}%</p>
                    <p>{item.consistentLineNum} lines</p>
                  </td>
                  <td className="dochub-doc-list-table__td dochub-doc-list-table__operation">
                    <Link to={getTranslateLink(item.path)}>translate</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {total === 0 && (
              <tr className="dochub-doc-list-table__footer">
                <td colSpan={6} className="dochub-doc-list-table__td">
                  No data.
                </td>
              </tr>
            )}
            {total > pageSize && (
              <tr className="dochub-doc-list-table__footer">
                <td colSpan={6}>
                  <ReactPaginate
                    className="dochub-doc-list-table__pagination"
                    breakLabel="..."
                    nextLabel="next >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    forcePage={forcePage}
                    pageCount={Math.ceil(total / pageSize)}
                    previousLabel="< previous"
                    renderOnZeroPageCount={() => null}
                  />
                </td>
              </tr>
            )}
          </tfoot>
        </table>
        <Loading loading={loading}></Loading>
      </div>
    </>
  );
}

export default RelationList;
