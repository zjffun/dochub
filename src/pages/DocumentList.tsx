import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections } from "../api";
import Header from "../components/Header";
import { ICollection } from "../types";

function DocumentList() {
  const [list, setList] = useState<ICollection[]>([]);

  useEffect(() => {
    getCollections().then((data) => {
      setList(data);
    });
  }, []);

  return (
    <>
      <Header></Header>
      <div>
        <ul>
          {list.map((item) => {
            return (
              <li key={item.nameId}>
                <Link to={`/doc/${item.nameId}`}>
                  <span>{item.name}</span>
                  <span>&nbsp;---&nbsp;</span>
                  <span>{item.desc}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default DocumentList;
