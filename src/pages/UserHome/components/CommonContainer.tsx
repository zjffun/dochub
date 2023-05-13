import { FC, useEffect } from "react";
import Header from "../../../components/Header";
import usePermissions from "../../../hooks/usePermissions";
import { useStoreContext } from "../../../store";
import Nav from "./Nav";
import Profile from "./Profile";

import "./CommonContainer.scss";

const CommonContainer: FC<{
  type: string;
  login: string;
  children: React.ReactNode;
}> = ({ type, login, children }) => {
  const docPath = `/${login}`;

  const { setHasWritePermission } = useStoreContext();
  const { hasWritePermission } = usePermissions(docPath);

  useEffect(() => {
    setHasWritePermission(hasWritePermission);
  }, [setHasWritePermission, hasWritePermission]);

  return (
    <>
      <Header></Header>
      <div className="dochub-user-home-common-container">
        <div className="dochub-user-home-common-container__nav">
          <Nav login={login} type={type}></Nav>
        </div>
        <div className="dochub-user-home-common-container__content">
          <div className="dochub-user-home-common-container__content__profile">
            <Profile login={login}></Profile>
          </div>
          <div className="dochub-user-home-common-container__content__main">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommonContainer;
