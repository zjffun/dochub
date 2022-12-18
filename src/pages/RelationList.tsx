import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getListGroupByPath } from "../api";
import { IRelationGroupByPath } from "../types";

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

  const params = useParams();
  const docName = params.id;

  useEffect(() => {
    getListGroupByPath().then((data) => {
      setList(data);
    });
  }, []);

  return (
    <div>
      <ul>
        {list.map((item) => {
          return (
            <li key={item.fromPath}>
              <a
                target="_blank"
                href={getHref(docName, item.fromPath, item.toPath)}
              >
                <span>{item.fromPath}</span>
                <span>&nbsp;---&gt;---&nbsp;</span>
                <span>{item.toPath}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RelationList;
