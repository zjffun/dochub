import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteDoc } from "../api";
import { useStoreContext } from "../store";
import { getPercent } from "../utils/progress";

import "./DocItem.scss";

function DocItem({
  path,
  originalLineNum,
  translatedLineNum,
  consistentLineNum,
  isDelete,
  onDeleteDoc,
}: {
  path: string;
  originalLineNum?: number;
  translatedLineNum?: number;
  consistentLineNum?: number;
  isDelete?: boolean;
  onDeleteDoc?: () => void;
}) {
  const { userInfo } = useStoreContext();

  function getTranslateLink(path: string) {
    if (userInfo?.login) {
      return `/translate${path}`;
    }

    return `/preview${path}`;
  }

  function getTitlePath(path: string) {
    const reg = new RegExp(`^${window.location.pathname}`);
    return path.replace(reg, "").replace(/^\//, "");
  }

  function handleDeleteClick(path: string) {
    let confirmTip = `Delete ${path} ?`;
    let permanently = false;
    let successTip = `Delete ${path} success`;

    if (isDelete === true) {
      confirmTip = `Permanently delete ${path} ?`;
      permanently = true;
      successTip = `Permanently delete ${path} success`;
    }

    const res = window.confirm(confirmTip);
    if (res) {
      deleteDoc({
        path,
        permanently,
      }).then(() => {
        toast.success(successTip);
        onDeleteDoc?.();
      });
    }
  }

  return (
    <section className="dochub-component-doc-item">
      <h3 className="dochub-component-doc-item__title">
        <Link to={getTranslateLink(path)}>{getTitlePath(path)}</Link>
      </h3>
      <p className="dochub-component-doc-item__path">{path}</p>
      <div className="dochub-component-doc-item__footer">
        <span
          className="dochub-component-doc-item__footer__item"
          title={`translated: ${translatedLineNum} / original: ${originalLineNum}`}
        >
          translated: {getPercent(translatedLineNum, originalLineNum)}%
        </span>
        <span
          className="dochub-component-doc-item__footer__item"
          title={`consistent: ${consistentLineNum} / original: ${originalLineNum}`}
        >
          consistent: {getPercent(consistentLineNum, originalLineNum)}%
        </span>
        <div
          style={{
            flex: "1 1 auto",
          }}
        ></div>
        <button
          className="dochub-component-doc-item__footer__delete btn btn-small btn-danger"
          onClick={() => handleDeleteClick(path)}
        >
          Delete
        </button>
      </div>
    </section>
  );
}

export default DocItem;
