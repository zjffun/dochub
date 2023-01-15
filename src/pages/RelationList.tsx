import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { getListGroupByPath } from "../api";
import Header from "../components/Header";
import { IRelationGroupByPath } from "../types";

import "./RelationList.scss";
import { getConsistentPercent, getTranslatedPercent } from "../utils/progress";

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

  const params = useParams();
  const nameId = params.nameId;

  function handlePageClick(data: any) {
    setForcePage(data.selected);
  }

  useEffect(() => {
    if (!nameId) return;

    getListGroupByPath({
      nameId,
      page: forcePage + 1,
      pageSize,
    }).then((data) => {
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
    });
  }, [nameId, forcePage]);

  return (
    <>
      <Header></Header>
      <div className="dochub-relation-table-wrapper">
        <table className="dochub-relation-table">
          <tr className="dochub-relation-table__header">
            <th className="dochub-relation-table__th">#</th>
            <th className="dochub-relation-table__th">Name</th>
            <th className="dochub-relation-table__th">Original</th>
            <th className="dochub-relation-table__th">Consistent</th>
            <th className="dochub-relation-table__th">Translated</th>
            <th className="dochub-relation-table__th"></th>
          </tr>
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
          {total && (
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
        </table>
      </div>
    </>
  );
}

export default RelationList;
