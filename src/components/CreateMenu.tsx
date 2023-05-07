import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../store";

import "./CreateMenu.scss";

function CreateMenu() {
  const { userInfo } = useContext(StoreContext);
  const [isOpeningMenu, setIsOpeningMenu] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpeningMenu(!isOpeningMenu);
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
    <details className="dochub-component-create-menu" open={isOpeningMenu}>
      <summary
        className="dochub-component-create-menu__summary"
        onClick={toggleMenu}
      >
        <svg
          aria-hidden="true"
          height="16"
          viewBox="0 0 16 16"
          version="1.1"
          width="16"
          data-view-component="true"
          className="dochub-icon"
        >
          <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
        </svg>
        <span className="dropdown-caret"></span>
      </summary>
      <ul className="dochub-component-create-menu__list surface">
        <li className="dochub-component-create-menu__list__item dochub-component-create-menu__list__item--link">
          <Link to={`/new/${userInfo?.login}`}>New doc</Link>
        </li>
        <li className="dochub-component-create-menu__list__item dochub-component-create-menu__list__item--link">
          <Link to={`/new-project`}>New project</Link>
        </li>
      </ul>
    </details>
  );
}

export default CreateMenu;
