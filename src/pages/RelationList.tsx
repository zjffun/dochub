import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useParams } from "react-router-dom";
import { getListGroupByPath } from "../api";
import Header from "../components/Header";
import { IRelationGroupByPath } from "../types";

import Loading from "../components/Loading";
import { getConsistentPercent, getTranslatedPercent } from "../utils/progress";
import "./RelationList.scss";

function getHref(
  docName: string | undefined,
  fromPath: string,
  toPath: string
) {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set("fromPath", fromPath);
  urlSearchParams.set("toPath", toPath);
  return `/relation/${docName}?${urlSearchParams.toString()}`;
}

const pageSize = 20;

function RelationList() {
  const [list, setList] = useState<IRelationGroupByPath[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const nameId = params.nameId;

  function handlePageClick(data: any) {
    setForcePage(data.selected);
  }

  useEffect(() => {
    if (!nameId) return;
    setLoading(true);

    getListGroupByPath({
      nameId,
      page: forcePage + 1,
      pageSize,
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
  }, [nameId, forcePage]);

  return (
    <>
      <Header></Header>
      <div className="dochub-relation-table-wrapper">
        <table className="dochub-relation-table">
          <thead>
            <tr className="dochub-relation-table__header">
              <th className="dochub-relation-table__th">#</th>
              <th className="dochub-relation-table__th">Name</th>
              <th className="dochub-relation-table__th">Original</th>
              <th className="dochub-relation-table__th">Consistent</th>
              <th className="dochub-relation-table__th">Translated</th>
              <th className="dochub-relation-table__th"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => {
              return (
                <tr className="dochub-relation-table__tr" key={item.fromPath}>
                  <td className="dochub-relation-table__td dochub-relation-table__id">
                    {forcePage * pageSize + i + 1}
                  </td>
                  <td className="dochub-relation-table__td dochub-relation-table__name">
                    {item.toPath}
                  </td>
                  <td className="dochub-relation-table__td dochub-relation-table__original">
                    <p>{item.originalLineNum} lines</p>
                  </td>
                  <td className="dochub-relation-table__td dochub-relation-table__consistent">
                    <p>{getConsistentPercent(item)}%</p>
                    <p>{item.consistentLineNum} lines</p>
                  </td>
                  <td className="dochub-relation-table__td dochub-relation-table__translated">
                    <p>{getTranslatedPercent(item)}%</p>
                    <p>{item.translatedLineNum} lines</p>
                  </td>
                  <td className="dochub-relation-table__td dochub-relation-table__operation">
                    <a href={getHref(nameId, item.fromPath, item.toPath)}>
                      translate
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {total === 0 && (
              <tr className="dochub-relation-table__footer">
                <td colSpan={6} className="dochub-relation-table__td">
                  No data.
                </td>
              </tr>
            )}
            {total > pageSize && (
              <tr className="dochub-relation-table__footer">
                <td colSpan={6}>
                  <ReactPaginate
                    className="dochub-relation-table__pagination"
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
      </div>
      <Loading loading={loading}></Loading>
    </>
  );
}

export default RelationList;
