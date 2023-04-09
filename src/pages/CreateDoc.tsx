// @ts-ignore
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { createDoc } from "../api";
import {
  getBranchRev,
  getContents,
  getLastOriginalFromRev,
  getPathRev,
} from "../api/github";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useStoreContext } from "../store";
import { IFormOption } from "../types";
import { githubUrl } from "../utils/githubUrl";
import pathInfo from "../utils/pathInfo";

import "./CreateDoc.scss";

function RelationList() {
  const { docPath } = pathInfo();
  const { userInfo } = useStoreContext();
  const navigate = useNavigate();

  const [startPathOptions, setStartPathOptions] = useState<IFormOption[]>([]);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const handleFromSubmit = handleSubmit(async (data) => {
    const postData = {
      path: `${data.startPath}${data.path}`,
      originalOwner: data.originalOwner,
      originalRepo: data.originalRepo,
      originalBranch: data.originalBranch,
      originalPath: data.originalPath,
      originalRev: data.originalRev,
      originalContent: "",
      originalFromRev: data.originalFromRev,
      originalFromContent: "",
      translatedOwner: data.translatedOwner,
      translatedRepo: data.translatedRepo,
      translatedBranch: data.translatedBranch,
      translatedPath: data.translatedPath,
      translatedRev: data.translatedRev,
      translatedContent: "",
    };

    setLoading(true);

    try {
      // originalContent
      const originalContent = await getContents({
        owner: data.originalOwner,
        repo: data.originalRepo,
        rev: data.originalRev,
        path: data.originalPath,
      });
      if (!originalContent) {
        throw new Error("originalContent is empty");
      }
      postData.originalContent = originalContent;

      // originalFromContent
      const originalFromContent = await getContents({
        owner: data.originalOwner,
        repo: data.originalRepo,
        rev: data.originalFromRev,
        path: data.originalPath,
      });
      if (!originalFromContent) {
        throw new Error("originalFromContent is empty");
      }
      postData.originalFromContent = originalFromContent;

      // translatedContent
      const translatedContent = await getContents({
        owner: data.translatedOwner,
        repo: data.translatedRepo,
        rev: data.translatedRev,
        path: data.translatedPath,
      });
      if (!translatedContent) {
        throw new Error("translatedContent is empty");
      }
      postData.translatedContent = translatedContent;

      // create doc
      const { path } = await createDoc(postData);

      navigate(`/translate${path}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  async function handleParseClick() {
    try {
      await parseTranslatedUrl();
    } catch (error) {
      console.error(error);
    }

    try {
      await parseOriginalUrl();
    } catch (error) {
      console.error(error);
    }
  }

  async function parseOriginalUrl() {
    const originalUrl = watch("originalUrl");
    const parsedOriginalUrl = githubUrl(originalUrl);
    setValue("originalOwner", parsedOriginalUrl.owner);
    setValue("originalRepo", parsedOriginalUrl.repo);
    setValue("originalBranch", parsedOriginalUrl.branch);
    setValue("originalPath", parsedOriginalUrl.path);

    const { oid, date } = await getBranchRev({
      owner: parsedOriginalUrl.owner,
      repo: parsedOriginalUrl.repo,
      branch: parsedOriginalUrl.branch,
    });
    if (!oid) {
      throw new Error("originalRev is empty");
    }
    setValue("originalRev", oid);
    if (!date) {
      throw new Error("originalRevDate is empty");
    }
    setValue("originalRevDate", date);

    const { oid: originalFromRev, date: originalFromRevDate } =
      await getLastOriginalFromRev({
        owner: parsedOriginalUrl.owner,
        repo: parsedOriginalUrl.repo,
        branch: parsedOriginalUrl.branch,
        date: watch("translatedRevDate") || date,
      });
    if (!originalFromRev) {
      throw new Error("originalFromRev is empty");
    }
    setValue("originalFromRev", originalFromRev);
    if (!originalFromRevDate) {
      throw new Error("originalFromRevDate is empty");
    }
    setValue("originalFromRevDate", originalFromRevDate);
  }

  async function parseTranslatedUrl() {
    const translatedUrl = watch("translatedUrl");
    const parsedTranslatedUrl = githubUrl(translatedUrl);
    setValue("translatedOwner", parsedTranslatedUrl.owner);
    setValue("translatedRepo", parsedTranslatedUrl.repo);
    setValue("translatedBranch", parsedTranslatedUrl.branch);
    setValue("translatedPath", parsedTranslatedUrl.path);
    setValue(
      "path",
      `${parsedTranslatedUrl.owner}/${parsedTranslatedUrl.repo}/${parsedTranslatedUrl.branch}/${parsedTranslatedUrl.path}`
    );

    const { oid, date } = await getPathRev({
      owner: parsedTranslatedUrl.owner,
      repo: parsedTranslatedUrl.repo,
      branch: parsedTranslatedUrl.branch,
      path: parsedTranslatedUrl.path,
    });
    if (!oid) {
      throw new Error("translatedRev is empty");
    }
    setValue("translatedRev", oid);
    if (!date) {
      throw new Error("translatedRevDate is empty");
    }
    setValue("translatedRevDate", date);
  }

  const globalRef = useRef<{
    setValue?: typeof setValue;
  }>({});
  globalRef.current.setValue = setValue;

  useEffect(() => {
    const options: IFormOption[] = [
      { label: `${docPath}/`, value: `${docPath}/` },
    ];

    if (userInfo?.login) {
      if (!docPath.startsWith(`/${userInfo.login}`)) {
        options.unshift({
          label: `/${userInfo.login}${docPath}/`,
          value: `/${userInfo.login}${docPath}/`,
        });
      }
    }
    setStartPathOptions(options);

    globalRef.current?.setValue?.("startPath", options[0].value);
  }, [userInfo?.login, docPath]);

  return (
    <>
      <Header></Header>
      <div className="dochub-create-doc">
        <h2 className="dochub-create-doc-title">Create a new document</h2>
        <form onSubmit={handleFromSubmit} className="dochub-create-doc-form">
          <section className="dochub-create-doc-form-container surface">
            <h3
              className="dochub-create-doc-form-subtitle title-large"
              style={{ marginBottom: "1rem" }}
            >
              Auto fill through GitHub URL
            </h3>
            <div className="dochub-create-doc-form__item">
              <label>
                <span className="dochub-create-doc-form__item__label">
                  GitHub Original URL
                </span>
                <input
                  {...register("originalUrl")}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
              </label>
            </div>
            <div className="dochub-create-doc-form__item">
              <label>
                <span className="dochub-create-doc-form__item__label">
                  GitHub Translated URL
                </span>
                <input
                  {...register("translatedUrl")}
                  className="input"
                  type="text"
                  style={{ width: "100%" }}
                />
              </label>
            </div>
            <div>
              <button className="btn" type="button" onClick={handleParseClick}>
                parse
              </button>
            </div>
          </section>

          <div className="dochub-create-doc-form-container surface">
            <div className="dochub-create-doc-form__item">
              <label>
                <span className="dochub-create-doc-form__item__label">
                  Doc Path
                </span>
                <span className="dochub-create-doc-form-doc-path">
                  <select
                    {...register("startPath", {
                      required: true,
                    })}
                    className="dochub-create-doc-form-doc-path__select select"
                  >
                    {startPathOptions.map((o) => {
                      return (
                        <option value={o.value} key={o.value}>
                          {o.label}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    {...register("path", { required: true })}
                    className="dochub-create-doc-form-doc-path__input input"
                    type="text"
                    style={{ flex: "1 1 auto" }}
                  />
                </span>
                <p>{errors.path && <span>This field is required</span>}</p>
              </label>
            </div>
          </div>

          <div className="dochub-create-doc-original-translated">
            <section className="dochub-create-doc-form-container surface">
              <details>
                <summary>
                  <span className="title-medium">Original</span>
                </summary>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Owner
                    </span>
                    <input
                      {...register("originalOwner")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Repo
                    </span>
                    <input
                      {...register("originalRepo")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Branch
                    </span>
                    <input
                      {...register("originalBranch")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Path
                    </span>
                    <input
                      {...register("originalPath")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Rev
                    </span>
                    <input
                      {...register("originalRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{watch("originalRevDate")}</p>
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      From Rev
                    </span>
                    <input
                      {...register("originalFromRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{watch("originalFromRevDate")}</p>
                  </label>
                </div>
              </details>
            </section>

            <section className="dochub-create-doc-form-container surface">
              <details>
                <summary>
                  <span className="title-medium">Translated</span>
                </summary>

                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Owner
                    </span>
                    <input
                      {...register("translatedOwner")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Repo
                    </span>
                    <input
                      {...register("translatedRepo")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Branch
                    </span>
                    <input
                      {...register("translatedBranch")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Path
                    </span>
                    <input
                      {...register("translatedPath")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      Rev
                    </span>
                    <input
                      {...register("translatedRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{watch("translatedRevDate")}</p>
                  </label>
                </div>
              </details>
            </section>
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

export default RelationList;
