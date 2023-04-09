import React, { FC, useContext, useEffect } from "react";
import { getUser, getUserMute } from "./api";
import { IUserInfo } from "./types";

export const StoreContext = React.createContext<{
  userInfo: IUserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo | null>>;
}>({
  userInfo: null,
  setUserInfo: () => {},
});

const Store: FC<{ children: any }> = ({ children }) => {
  const [userInfo, setUserInfo] = React.useState<IUserInfo | null>(null);

  const stateRef = React.useRef({
    setUserInfo: setUserInfo,
  });

  stateRef.current.setUserInfo = setUserInfo;

  const store = {
    userInfo,
    setUserInfo,
  };

  useEffect(() => {
    getUserMute().then((user) => {
      stateRef.current.setUserInfo(user);
    });
  }, []);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === "signInSuccess") {
        getUser().then((user) => {
          stateRef.current.setUserInfo(user);
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStoreContext = () => useContext(StoreContext);

export default Store;
