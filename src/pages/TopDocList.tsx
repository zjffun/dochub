import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDocs } from "../api";
import Header from "../components/Header";
import { IDoc } from "../types";
import { getPercent } from "../utils/progress";

import "./TopDocList.scss";

function TopDocList() {
  const [list, setList] = useState<IDoc[]>([]);

  useEffect(() => {
    getDocs().then((data) => {
      setList(data.list);
    });
  }, []);

  return (
    <>
      <Header></Header>
      <div className="dochub-top-doc-list">
        <ul className="dochub-top-doc-list__ul">
          {list.map((item) => {
            const translated = getPercent(
              item.translatedLineNum,
              item.originalLineNum
            );
            const consistent = getPercent(
              item.consistentLineNum,
              item.originalLineNum
            );
            return (
              <li className="dochub-top-doc-list__ul__li" key={item.name}>
                <div
                  className="dochub-top-doc-list__ul__li__bg"
                  style={{
                    backgroundImage: `url(${item.logoUrl})`,
                  }}
                >
                  <div className="dochub-project-card">
                    <a className="dochub-project-card__link" href={item.docUrl}>
                      <span style={{ visibility: "hidden" }}>{item.name}</span>
                    </a>
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
                          to={item.path}
                        >
                          contribute
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default TopDocList;
