import classnames from "classnames";
import { useNavigate, useParams } from "react-router";

import "./Nav.scss";

function Nav({ type, login }: { type: string; login: string }) {
  const navigate = useNavigate();

  const items = [
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
  ];

  return (
    <ul className="dochub-user-home-nav">
      {items.map((item) => {
        return (
          <li
            key={item.type}
            className={classnames("dochub-user-home-nav__item", {
              "dochub-user-home-nav__item--active": item.type === type,
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
