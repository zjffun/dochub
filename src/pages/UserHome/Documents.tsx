import { useParams } from "react-router";
import DocList from "../../components/DocList";
import CommonContainer from "./components/CommonContainer";

import "./Documents.scss";

function UserHome() {
  const params = useParams();

  const login = params.login;
  const pathname = `/${login}`;

  if (!login) {
    return null;
  }

  return (
    <CommonContainer login={login} type="documents">
      <div className="dochub-user-home-documents">
        <DocList pathname={pathname}></DocList>
      </div>
    </CommonContainer>
  );
}

export default UserHome;
