import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { createProject } from "../api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import useCurrentRef from "../hooks/useCurrentRef";
import { useStoreContext } from "../store";
import { IDoc } from "../types";

import "./CreateProject.scss";

function CreateProject() {
  const { userInfo } = useStoreContext();
  const navigate = useNavigate();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const handleFromSubmit = handleSubmit(async (data) => {
    // TODO: create project doc
    const postData: IDoc = {
      path: `/${data.path}`,
      name: data.name,
      desc: data.desc,
      // lang: data.lang,
      docUrl: data.docUrl,
      logoUrl: data.logoUrl,
    };

    try {
      setLoading(true);

      const { path } = await createProject(postData);

      navigate(path);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  const currentRef = useCurrentRef<{
    setValue: typeof setValue;
  }>({
    setValue,
  });

  return (
    <>
      <Header></Header>
      <div className="dochub-page-create-project">
        <h2 className="dochub-page-create-project-title">
          Create a new project
        </h2>
        <form
          onSubmit={handleFromSubmit}
          className="dochub-page-create-project-form"
        >
          <div className="dochub-page-create-project-form-container surface">
            <div className="dochub-page-create-project-form__item">
              <label>
                <span className="dochub-page-create-project-form__item__label">
                  Name
                </span>
                <span>
                  <input
                    {...register("name", { required: true })}
                    className="input"
                    type="text"
                    style={{ width: "100%" }}
                  />
                </span>
                <p>{errors.name && <span>This field is required</span>}</p>
              </label>
            </div>
            <div className="dochub-page-create-project-form__item">
              <label>
                <span className="dochub-page-create-project-form__item__label">
                  Path
                </span>
                <span className="dochub-page-create-project-form-path">
                  <span className="dochub-page-create-project-form-path__before input">
                    /
                  </span>
                  <input
                    {...register("path", { required: true })}
                    className="dochub-page-create-project-form-path__input input"
                    type="text"
                    style={{ flex: "1 1 auto" }}
                  />
                </span>
                <p>
                  {errors.projectPath && <span>This field is required</span>}
                </p>
              </label>
            </div>
            <div className="dochub-page-create-project-form__item">
              <label>
                <span className="dochub-page-create-project-form__item__label">
                  Description
                </span>
                <span>
                  <input
                    {...register("desc")}
                    className="input"
                    type="text"
                    style={{ width: "100%" }}
                  />
                </span>
              </label>
            </div>
            <div className="dochub-page-create-project-form__item">
              <label>
                <span className="dochub-page-create-project-form__item__label">
                  Doc URL
                </span>
                <span>
                  <input
                    {...register("docUrl")}
                    className="input"
                    type="text"
                    style={{ width: "100%" }}
                  />
                </span>
              </label>
            </div>
            <div className="dochub-page-create-project-form__item">
              <label>
                <span className="dochub-page-create-project-form__item__label">
                  Logo URL
                </span>
                <span>
                  <input
                    {...register("logoUrl")}
                    className="input"
                    type="text"
                    style={{ width: "100%" }}
                  />
                </span>
              </label>
            </div>
          </div>

          <button className="btn btn-primary" type="submit">
            Create
          </button>
        </form>
      </div>

      <Loading loading={loading}></Loading>
    </>
  );
}

export default CreateProject;
