import { useStoreContext } from "../store";
import openSignInWindow from "../utils/openSignInWindow";
import UserMenu from "./UserMenu";

import "./Header.scss";
import CreateMenu from "./CreateMenu";

function Header() {
  const { userInfo } = useStoreContext();

  return (
    <header className="dochub-component-header">
      <a className="dochub-component-header__name" href="/">
        DocHub
      </a>
      <div style={{ flex: "1 1 auto" }}></div>
      <section className="dochub-component-header__right">
        {userInfo ? (
          <>
            <CreateMenu></CreateMenu>
            <UserMenu></UserMenu>
          </>
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
