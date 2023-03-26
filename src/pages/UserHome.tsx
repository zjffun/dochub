import { useEffect, useState } from "react";
import { getDocs } from "../api";
import Header from "../components/Header";
import { useStoreContext } from "../store";
import { IDoc } from "../types";
import pathInfo from "../utils/pathInfo";

import "./UserHome.scss";

const pageSize = 20;

function UserHome() {
  const { docPath } = pathInfo();

  const { userInfo } = useStoreContext();

  const [list, setList] = useState<IDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [forcePage, setForcePage] = useState(0);
  const [loading, setLoading] = useState(false);

  function getTranslateLink(path: string) {
    if (userInfo?.login) {
      return `/translate${path}`;
    }

    return `/preview${path}`;
  }

  function handlePageClick(data: any) {
    setForcePage(data.selected);
  }

  useEffect(() => {
    setLoading(true);

    getDocs({
      page: forcePage + 1,
      pageSize,
      path: docPath,
      depth: 999,
    })
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
  }, [forcePage, docPath]);

  return (
    <>
      <Header></Header>
    </>
  );
}

export default UserHome;
