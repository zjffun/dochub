import { useParams } from "react-router-dom";
import CommonContainer from "./components/CommonContainer";

import "./Overview.scss";

function UserHome() {
  const params = useParams();

  const login = params.login;

  if (!login) {
    return null;
  }

  return (
    <>
      <CommonContainer login={login} type="overview">
        <div className="dochub-user-home-overview">TODO</div>
      </CommonContainer>
    </>
  );
}

export default UserHome;
