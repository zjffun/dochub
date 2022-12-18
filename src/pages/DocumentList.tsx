import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections } from "../api";
import { ICollection } from "../types";

function DocumentList() {
  const [list, setList] = useState<ICollection[]>([]);

  useEffect(() => {
    getCollections().then((data) => {
      setList(data);
    });
  }, []);

  return (
    <div>
      <ul>
        {list.map((item) => {
          return (
            <li key={item.name}>
              <Link to={`/doc/${item.name}`}>
                <span>{item.name}</span>
                <span>&nbsp;---&nbsp;</span>
                <span>{item.desc}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DocumentList;
