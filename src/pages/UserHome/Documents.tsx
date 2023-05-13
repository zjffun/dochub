import { useParams } from "react-router";
import DocHeader from "../../components/DocHeader";
import DocList from "../../components/DocList";
import CommonContainer from "./components/CommonContainer";

import "./Documents.scss";

function UserHome() {
  const params = useParams();

  const login = params.login;
  const docPath = `/${login}`;

  if (!login) {
    return null;
  }

  return (
    <CommonContainer login={login} type="documents">
      <div className="dochub-user-home-documents">
        <DocHeader docPath={docPath}></DocHeader>
        <DocList docPath={docPath}></DocList>
      </div>
    </CommonContainer>
  );
}

export default UserHome;
