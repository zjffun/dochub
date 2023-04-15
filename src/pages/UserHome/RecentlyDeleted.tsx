import { useParams } from "react-router";
import DocList from "../../components/DocList";
import CommonContainer from "./components/CommonContainer";

import "./RecentlyDeleted.scss";

function RecentlyDeleted() {
  const params = useParams();

  const login = params.login;
  const pathname = `/${login}`;

  if (!login) {
    return null;
  }

  return (
    <CommonContainer login={login} type="recently-deleted">
      <div className="dochub-user-home-documents">
        <DocList pathname={pathname} isDelete={true}></DocList>
      </div>
    </CommonContainer>
  );
}

export default RecentlyDeleted;
