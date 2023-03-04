import { useRef } from "react";
import { useNavigate } from "react-router";
import { login as loginApi } from "../../api/admin";
import Header from "../../components/Header";

import "./LoginPage.scss";

function AdminLogin() {
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement | null>(null);

  async function login(event: any) {
    event.preventDefault();

    if (formRef.current) {
      const fromData = new FormData(formRef.current);
      const { access_token } = await loginApi(
        fromData.get("username") as string,
        fromData.get("password") as string
      );
      localStorage.setItem("access_token", access_token);
      navigate("/admin/collection");
    }
  }

  return (
    <>
      <Header></Header>
      <form ref={formRef}>
        <label>
          username:
          <input name="username" type="text" />
        </label>
        <label>
          password:
          <input name="password" type="password" />
        </label>
        <button onClick={login}>登录</button>
      </form>
    </>
  );
}

export default AdminLogin;
