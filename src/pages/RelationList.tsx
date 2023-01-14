import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { getListGroupByPath } from "../api";
import Header from "../components/Header";
import { IRelationGroupByPath } from "../types";

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

function RelationList() {
  const [list, setList] = useState<IRelationGroupByPath[]>([]);
  const [pageCount, setPageCount] = useState(10);
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
      page: 1,
      pageSize: 20,
    }).then((data) => {
      setList(data);
    });
  }, [nameId]);

  return (
    <>
      <Header></Header>
      <div className="dochub-relation-table-wrapper">
        <table className="dochub-relation-table">
          <tr className="dochub-relation-table__header">
            <th className="dochub-relation-table__th">#</th>
            <th className="dochub-relation-table__th">Name</th>
            <th className="dochub-relation-table__th">Consistent</th>
            <th className="dochub-relation-table__th">Translated</th>
            <th className="dochub-relation-table__th"></th>
          </tr>
          {list.map((item) => {
            return (
              <tr className="dochub-relation-table__tr" key={item.fromPath}>
                <td className="dochub-relation-table__td dochub-relation-table__id">
                  1
                </td>
                <td className="dochub-relation-table__td dochub-relation-table__name">
                  {item.toPath}
                </td>
                <td className="dochub-relation-table__td dochub-relation-table__consistent">
                  1
                </td>
                <td className="dochub-relation-table__td dochub-relation-table__translated">
                  2
                </td>
                <td className="dochub-relation-table__td dochub-relation-table__operation">
                  <a href={getHref(nameId, item.fromPath, item.toPath)}>
                    translate
                  </a>
                </td>
              </tr>
            );
          })}
          <tr className="dochub-relation-table__footer">
            <td colSpan={5}>
              <ReactPaginate
                className="dochub-relation-table__pagination"
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                forcePage={forcePage}
                pageCount={pageCount}
                previousLabel="< previous"
                renderOnZeroPageCount={() => null}
              />
            </td>
          </tr>
        </table>
      </div>
    </>
  );
}

export default RelationList;
