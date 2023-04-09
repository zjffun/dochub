import { useState } from "react";
import { useStoreContext } from "../store";
import openSignInWindow from "../utils/openSignInWindow";
import UserMenu from "./UserMenu";

import "./Header.scss";

function Header() {
  const { userInfo } = useStoreContext();

  return (
    <header className="dochub__header">
      <a className="dochub__header__name" href="/">
        DocHub
      </a>
      <div style={{ flex: "1 1 auto" }}></div>
      <section className="dochub__header__right">
        {userInfo ? (
          <UserMenu></UserMenu>
        ) : (
          <button className="btn" onClick={openSignInWindow}>
            Sign in
          </button>
        )}
      </section>
    </header>
  );
}

export default Header;
