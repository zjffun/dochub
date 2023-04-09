import { useParams } from "react-router";
import DocHeader from "../../components/DocHeader";
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
        <DocHeader pathname={pathname}></DocHeader>
        <DocList pathname={pathname}></DocList>
      </div>
    </CommonContainer>
  );
}

export default UserHome;
