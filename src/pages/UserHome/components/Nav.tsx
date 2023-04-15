import classnames from "classnames";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStoreContext } from "../../../store";

import "./Nav.scss";

interface Item {
  name: string;
  path: string;
  type: string;
  hidden?: boolean;
}

function Nav({ type, login }: { type: string; login: string }) {
  const navigate = useNavigate();
  const { userInfo } = useStoreContext();

  const [items, setItems] = useState<Item[]>([
    {
      name: "Overview",
      path: `/user/${login}`,
      type: "overview",
    },
    {
      name: "Documents",
      path: `/user/${login}/documents`,
      type: "documents",
    },
    {
      name: "Recently Deleted",
      path: `/user/${login}/recently-deleted`,
      type: "recently-deleted",
      hidden: true,
    },
  ]);

  useEffect(() => {
    if (userInfo?.login === login) {
      setItems((items) => {
        return items.map((d) => {
          if (d.type === "recently-deleted") {
            return {
              ...d,
              hidden: false,
            };
          }

          return d;
        });
      });
    }
  }, [userInfo?.login, login]);

  return (
    <ul className="nav">
      {items.map((item) => {
        if (item.hidden) {
          return null;
        }
        return (
          <li
            key={item.type}
            className={classnames("nav__item", {
              "nav__item--active": item.type === type,
            })}
            onClick={() => {
              navigate(item.path);
            }}
          >
            {item.name}
          </li>
        );
      })}
    </ul>
  );
}

export default Nav;
