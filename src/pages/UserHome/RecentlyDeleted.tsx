import { useParams } from "react-router";
import DocList from "../../components/DocList";
import CommonContainer from "./components/CommonContainer";

import "./RecentlyDeleted.scss";

function RecentlyDeleted() {
  const params = useParams();

  const login = params.login;
  const docPath = `/${login}`;

  if (!login) {
    return null;
  }

  return (
    <CommonContainer login={login} type="recently-deleted">
      <div className="dochub-user-home-documents">
        <DocList docPath={docPath} isDelete={true}></DocList>
      </div>
    </CommonContainer>
  );
}

export default RecentlyDeleted;
