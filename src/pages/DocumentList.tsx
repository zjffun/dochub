import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections } from "../api";
import Header from "../components/Header";
import { ICollection } from "../types";
import { getConsistentPercent, getTranslatedPercent } from "../utils/progress";

import "./DocumentList.scss";

function DocumentList() {
  const [list, setList] = useState<ICollection[]>([]);

  useEffect(() => {
    getCollections().then((data) => {
      setList(data.list);
    });
  }, []);

  return (
    <>
      <Header></Header>
      <div className="dochub-doc-list-wrapper">
        <ul className="dochub-doc-list">
          {list.map((item) => {
            const translated = getTranslatedPercent(item);
            const consistent = getConsistentPercent(item);
            return (
              <li className="dochub-doc-list__item" key={item.nameId}>
                <div
                  className="dochub-doc-list__item__bg"
                  style={{
                    backgroundImage: `url(${item.logoUrl})`,
                  }}
                >
                  <a className="dochub-doc-list__item__link" href={item.docUrl}>
                    <div className="dochub-project-card">
                      <h2 className="dochub-project-card__name">{item.name}</h2>
                      <p className="dochub-project-card__desc">{item.desc}</p>
                      <div className="dochub-progress">
                        <div className="dochub-progress__bar">
                          <div
                            className="dochub-progress__bar__translated"
                            style={{ right: `${100 - translated}%` }}
                          ></div>
                          <div
                            className="dochub-progress__bar__consistent"
                            style={{ right: `${100 - consistent}%` }}
                          ></div>
                        </div>
                        <div className="dochub-progress__detail">
                          <span className="dochub-progress__detail__consistent">
                            {`${consistent}% `}
                            consistent
                          </span>
                          <span className="dochub-progress__detail__translated">
                            {`${translated}%`}
                            translated
                          </span>{" "}
                          |{" "}
                          <Link
                            className="dochub-progress__detail__contribute"
                            to={`/doc/${item.nameId}`}
                          >
                            contribute
                          </Link>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default DocumentList;
