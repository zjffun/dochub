import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../store";

import "./UserMenu.scss";

function UserMenu() {
  const { userInfo } = useContext(StoreContext);
  const [isOpeningMenu, setIsOpeningMenu] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpeningMenu(!isOpeningMenu);
  };

  const signOut = (e: React.MouseEvent) => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setIsOpeningMenu(false);
    };

    document.body.addEventListener("click", handleClick);
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <details className="dochub__user-menu" open={isOpeningMenu}>
      <summary className="dochub__user-menu__summary" onClick={toggleMenu}>
        <img
          className="dochub__user-menu__summary__avatar"
          src={userInfo?.avatarUrl}
          alt={userInfo?.name || ""}
          width={20}
          height={20}
        />
        <span className="dropdown-caret"></span>
      </summary>
      <ul className="dochub__user-menu__list surface">
        <li className="dochub__user-menu__list__item dochub__user-menu__list__item--link">
          <Link to={`/user/${userInfo?.login}`}>
            Signed in as <b>{userInfo?.name || ""}</b>
          </Link>
        </li>
        <li className="dochub__user-menu__list__divider"></li>
        <li className="dochub__user-menu__list__item" onClick={signOut}>
          Sign out
        </li>
      </ul>
    </details>
  );
}

export default UserMenu;
