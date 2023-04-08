import { useEffect, useState } from "react";
import { getUserByLogin } from "../../../api";
import { IUserInfo } from "../../../types";

import "./Profile.scss";

function Profile({ login }: { login: string }) {
  const [userInfo, setUserInfo] = useState<IUserInfo | undefined>();

  useEffect(() => {
    getUserByLogin(login).then((user) => {
      setUserInfo(user);
    });
  }, [login]);

  return (
    <section className="dochub-user-home-profile">
      <div className="dochub-user-home-profile__avatar">
        <img
          className="dochub-user-home-profile__avatar__img"
          src={userInfo?.avatarUrl}
          alt=""
        />
      </div>
      <div className="dochub-user-home-profile__name">{userInfo?.name}</div>
      <div className="dochub-user-home-profile__login">{userInfo?.login}</div>
    </section>
  );
}

export default Profile;
