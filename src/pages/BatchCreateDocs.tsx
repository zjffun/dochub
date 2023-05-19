import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { batchCreateDocs } from "../api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useStoreContext } from "../store";
import { IBatchCreateDocs } from "../types";
import { githubUrl } from "../utils/githubUrl";
import usePathInfo from "../utils/pathInfo";

import "./BatchCreateDocs.scss";

function CreateDoc({ typeLength }: { typeLength: number }) {
  const { docPath } = usePathInfo({
    typeLength,
  });

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
    const fromRepoUrl = data.fromRepoUrl;
    const {
      owner: fromOwner,
      repo: fromRepo,
      branch: fromBranch,
      path: fromPath,
    } = githubUrl(fromRepoUrl);

    const toRepoUrl = data.toRepoUrl;
    const {
      owner: toOwner,
      repo: toRepo,
      branch: toBranch,
      path: toPath,
    } = githubUrl(toRepoUrl);

    const postData: IBatchCreateDocs = {
      path: docPath,
      fromOwner,
      fromRepo,
      fromBranch,
      fromPath,
      fromGlobs: data.fromGlobs,
      toOwner,
      toRepo,
      toBranch,
      toPath,
      toGlobs: data.toGlobs,
    };

    try {
      setLoading(true);

      const { path } = await batchCreateDocs(postData);

      navigate(path);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <Header></Header>
      <div className="dochub-batch-create-doc">
        <h2 className="dochub-batch-create-doc-title">
          Batch Create new documents
        </h2>
        <form
          onSubmit={handleFromSubmit}
          className="dochub-batch-create-doc-form"
        >
          <section className="dochub-batch-create-doc-form-container surface">
            <h3
              className="dochub-batch-create-doc-form-subtitle title-large"
              style={{ marginBottom: "1rem" }}
            >
              Auto fill through GitHub URL
            </h3>
            <div className="dochub-batch-create-doc-form__item">
              <label>
                <span className="dochub-batch-create-doc-form__item__label">
                  GitHub Original Repository URL
                </span>
                <input
                  {...register("fromRepoUrl", { required: true })}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
                <p>
                  {errors.fromRepoUrl && <span>This field is required</span>}
                </p>
              </label>
            </div>
            <div className="dochub-batch-create-doc-form__item">
              <label>
                <span className="dochub-batch-create-doc-form__item__label">
                  GitHub Translated Repository URL
                </span>
                <input
                  {...register("toRepoUrl", { required: true })}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
                <p>{errors.path && <span>This field is required</span>}</p>
              </label>
            </div>
            <div className="dochub-batch-create-doc-form__item">
              <label>
                <span className="dochub-batch-create-doc-form__item__label">
                  GitHub Original Globs
                </span>
                <input
                  {...register("fromGlobs", {
                    required: true,
                    value: "**/*.md",
                  })}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
                <p>{errors.fromGlobs && <span>This field is required</span>}</p>
              </label>
            </div>
            <div className="dochub-batch-create-doc-form__item">
              <label>
                <span className="dochub-batch-create-doc-form__item__label">
                  GitHub Translated Glob
                </span>
                <input
                  {...register("toGlobs", { required: true, value: "**/*.md" })}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
                <p>{errors.toGlobs && <span>This field is required</span>}</p>
              </label>
            </div>
          </section>

          <button className="btn btn-primary" type="submit">
            Create
          </button>
        </form>
      </div>

      <Loading loading={loading}></Loading>
    </>
  );
}

export default CreateDoc;
