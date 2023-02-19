import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { getCollections } from "../../api";
import {
  addRelations,
  deleteRelations,
  updateProgressInfo,
} from "../../api/admin";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import { ICollection } from "../../types";
import {
  getConsistentPercent,
  getTranslatedPercent,
} from "../../utils/progress";
import "./CollectionsPage.scss";

const pageSize = 20;

function AdminCollections() {
  const [list, setList] = useState<ICollection[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

  function handlePageClick(data: any) {
    setForcePage(data.selected);
  }

  async function fetchList(forcePage: number) {
    setLoading(true);

    getCollections(forcePage + 1, pageSize)
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
  }

  async function handleImportRelationsClick(nameId: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        const relations = JSON.parse(text as string);
        relations.forEach((d: any) => {
          d.nameId = nameId;
        });

        await addRelations(relations);
        await fetchList(forcePage);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function handleDeleteAllRelationsClick(nameId: string) {
    const res = window.confirm(
      `Are you sure to delete all [${nameId}] relations?`
    );

    if (res) {
      await deleteRelations(nameId);
      await fetchList(forcePage);
    }
  }

  async function handleUpdateProgressInfoClick(nameId: string) {
    const res = window.confirm(
      `Are you sure to update [${nameId}] progress info?`
    );

    if (res) {
      await updateProgressInfo(nameId);
      await fetchList(forcePage);
    }
  }

  useEffect(() => {
    fetchList(forcePage);
  }, [forcePage]);

  return (
    <>
      <Header></Header>
      <div className="dochub-admin-collections-wrapper">
        <table className="dochub-admin-collections">
          <thead>
            <tr className="dochub-admin-collections__header">
              <th className="dochub-admin-collections__th">#</th>
              <th className="dochub-admin-collections__th">Name</th>
              <th className="dochub-admin-collections__th">NameId</th>
              <th className="dochub-admin-collections__th">Original</th>
              <th className="dochub-admin-collections__th">Translated</th>
              <th className="dochub-admin-collections__th">Consistent</th>
              <th className="dochub-admin-collections__th"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => {
              return (
                <tr className="dochub-admin-collections__tr" key={item.nameId}>
                  <td className="dochub-admin-collections__td dochub-admin-collections__id">
                    {forcePage * pageSize + i + 1}
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__name">
                    {item.name}
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__name">
                    {item.nameId}
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__original">
                    <p>{item.originalLineNum} lines</p>
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__translated">
                    <p>{getTranslatedPercent(item)}%</p>
                    <p>{item.translatedLineNum} lines</p>
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__consistent">
                    <p>{getConsistentPercent(item)}%</p>
                    <p>{item.consistentLineNum} lines</p>
                  </td>
                  <td className="dochub-admin-collections__td dochub-admin-collections__operation">
                    <button
                      onClick={() => handleImportRelationsClick(item.nameId)}
                    >
                      Import Relations
                    </button>
                    <button
                      onClick={() => handleDeleteAllRelationsClick(item.nameId)}
                    >
                      Delete All Relations
                    </button>
                    <button
                      onClick={() => handleUpdateProgressInfoClick(item.nameId)}
                    >
                      Update Progress Info
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {total === 0 && (
              <tr className="dochub-admin-collections__footer">
                <td colSpan={6} className="dochub-admin-collections__td">
                  No data.
                </td>
              </tr>
            )}
            {total > pageSize && (
              <tr className="dochub-admin-collections__footer">
                <td colSpan={6}>
                  <ReactPaginate
                    className="dochub-admin-collections__pagination"
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

export default AdminCollections;