import { Link } from "react-router-dom";
import { useStoreContext } from "../store";
import { getPercent } from "../utils/progress";

import "./DocItem.scss";

function DocItem({
  path,
  originalLineNum,
  translatedLineNum,
  consistentLineNum,
}: {
  path: string;
  originalLineNum?: number;
  translatedLineNum?: number;
  consistentLineNum?: number;
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

  return (
    <section className="dochub-doc-item">
      <h3 className="dochub-doc-item__title">
        <Link to={getTranslateLink(path)}>{getTitlePath(path)}</Link>
      </h3>
      <p className="dochub-doc-item__path">{path}</p>
      <div className="dochub-doc-item__footer">
        <span
          className="dochub-doc-item__footer__item"
          title={`translated: ${translatedLineNum} / original: ${originalLineNum}`}
        >
          translated: {getPercent(translatedLineNum, originalLineNum)}%
        </span>
        <span
          className="dochub-doc-item__footer__item"
          title={`consistent: ${consistentLineNum} / original: ${originalLineNum}`}
        >
          consistent: {getPercent(consistentLineNum, originalLineNum)}%
        </span>
      </div>
    </section>
  );
}

export default DocItem;
