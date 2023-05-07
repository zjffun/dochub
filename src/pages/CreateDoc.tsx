// @ts-ignore
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { createDoc } from "../api";
import {
  getBranchRev,
  getContent,
  getLastFromOriginalRev,
  getPathRev,
} from "../api/github";
import Header from "../components/Header";
import Loading from "../components/Loading";
import useCurrentRef from "../hooks/useCurrentRef";
import { useStoreContext } from "../store";
import { IDoc, IFormOption, IRelation } from "../types";
import formatTime from "../utils/fromatTime";
import getRelations from "../utils/generateRelations/mdx/getRelations";
import { githubUrl } from "../utils/githubUrl";
import pathInfo from "../utils/pathInfo";

import "./CreateDoc.scss";

function CreateDoc() {
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
    const postData: IDoc = {
      path: `${data.startPath}${data.path}`,
      fromOwner: data.fromOwner,
      fromRepo: data.fromRepo,
      fromBranch: data.fromBranch,
      fromPath: data.fromPath,
      fromOriginalRev: data.fromOriginalRev,
      fromModifiedRev: data.fromModifiedRev,
      fromOriginalContent: "",
      fromModifiedContent: "",
      toOwner: data.toOwner,
      toRepo: data.toRepo,
      toBranch: data.toBranch,
      toPath: data.toPath,
      toOriginalRev: data.toOriginalRev,
      toOriginalContent: "",
      relations: [],
    };

    try {
      setLoading(true);

      // fromModifiedContent
      const fromModifiedContent = await getContent({
        owner: data.fromOwner,
        repo: data.fromRepo,
        rev: data.fromModifiedRev,
        path: data.fromPath,
      });
      if (!fromModifiedContent) {
        throw new Error("fromModifiedContent is empty");
      }
      postData.fromModifiedContent = fromModifiedContent;

      // fromOriginalContent
      const fromOriginalContent = await getContent({
        owner: data.fromOwner,
        repo: data.fromRepo,
        rev: data.fromOriginalRev,
        path: data.fromPath,
      });
      if (!fromOriginalContent) {
        throw new Error("fromOriginalContent is empty");
      }
      postData.fromOriginalContent = fromOriginalContent;

      // toOriginalContent
      const toOriginalContent = await getContent({
        owner: data.toOwner,
        repo: data.toRepo,
        rev: data.toOriginalRev,
        path: data.toPath,
      });
      if (!toOriginalContent) {
        throw new Error("toOriginalContent is empty");
      }
      postData.toOriginalContent = toOriginalContent;

      // relations
      let relations: IRelation[] = [];
      if (watch("autoGenerateRelations") === true) {
        relations = await getRelations(fromOriginalContent, toOriginalContent);
      }

      postData.relations = relations;

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
      setLoading(true);

      resetDocInfo();

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

      const fromPath: string = watch("fromPath");
      const toPath: string = watch("toPath");

      if (fromPath.endsWith(".md") && toPath.endsWith(".md")) {
        setValue("autoGenerateRelations", true);
      } else {
        setValue("autoGenerateRelations", false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function resetDocInfo() {
    setValue("startPath", startPathOptions[0].value);
    setValue("path", "");
    resetOriginal();
    resetTranslated();
  }

  function resetOriginal() {
    setValue("fromOwner", "");
    setValue("fromRepo", "");
    setValue("fromBranch", "");
    setValue("fromPath", "");
    setValue("fromModifiedRev", "");
    setValue("fromModifiedRevDate", "");
    setValue("fromOriginalRev", "");
    setValue("fromOriginalRevDate", "");
  }

  function resetTranslated() {
    setValue("toOwner", "");
    setValue("toRepo", "");
    setValue("toBranch", "");
    setValue("toPath", "");
    setValue("toOriginalRev", "");
    setValue("toOriginalRevDate", "");
  }

  async function parseOriginalUrl() {
    const fromUrl = watch("fromUrl");
    const parsedOriginalUrl = githubUrl(fromUrl);
    setValue("fromOwner", parsedOriginalUrl.owner);
    setValue("fromRepo", parsedOriginalUrl.repo);
    setValue("fromBranch", parsedOriginalUrl.branch);
    setValue("fromPath", parsedOriginalUrl.path);

    const { rev: fromModifiedRev, date } = await getBranchRev({
      owner: parsedOriginalUrl.owner,
      repo: parsedOriginalUrl.repo,
      branch: parsedOriginalUrl.branch,
    });
    if (!fromModifiedRev) {
      throw new Error("fromModifiedRev is empty");
    }
    setValue("fromModifiedRev", fromModifiedRev);
    if (!date) {
      throw new Error("fromModifiedRevDate is empty");
    }
    setValue("fromModifiedRevDate", date);

    const { oid: fromOriginalRev, date: fromOriginalRevDate } =
      await getLastFromOriginalRev({
        owner: parsedOriginalUrl.owner,
        repo: parsedOriginalUrl.repo,
        branch: parsedOriginalUrl.branch,
        date: watch("toOriginalRevDate") || date,
      });
    if (!fromOriginalRev) {
      throw new Error("fromOriginalRev is empty");
    }
    setValue("fromOriginalRev", fromOriginalRev);
    if (!fromOriginalRevDate) {
      throw new Error("fromOriginalRevDate is empty");
    }
    setValue("fromOriginalRevDate", fromOriginalRevDate);
  }

  async function parseTranslatedUrl() {
    const toUrl = watch("toUrl");
    const parsedTranslatedUrl = githubUrl(toUrl);
    setValue("toOwner", parsedTranslatedUrl.owner);
    setValue("toRepo", parsedTranslatedUrl.repo);
    setValue("toBranch", parsedTranslatedUrl.branch);
    setValue("toPath", parsedTranslatedUrl.path);
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
      throw new Error("toOriginalRev is empty");
    }
    setValue("toOriginalRev", oid);
    if (!date) {
      throw new Error("toOriginalRevDate is empty");
    }
    setValue("toOriginalRevDate", date);
  }

  const currentRef = useCurrentRef<{
    setValue: typeof setValue;
  }>({
    setValue,
  });

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

    currentRef.current.setValue("startPath", options[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  {...register("fromUrl")}
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
                  {...register("toUrl")}
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
            <div className="dochub-create-doc-form__item">
              <span className="dochub-create-doc-form__item__label">
                Relations
              </span>
              <label>
                <span className="dochub-create-doc-form-relations">
                  <input
                    {...register("autoGenerateRelations")}
                    className="dochub-create-doc-form-relations__input"
                    type="checkbox"
                    style={{ flex: "1 1 auto" }}
                  />{" "}
                  Auto Generate Relations
                </span>
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
                      {...register("fromOwner")}
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
                      {...register("fromRepo")}
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
                      {...register("fromBranch")}
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
                      {...register("fromPath")}
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
                      {...register("fromModifiedRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{formatTime(watch("fromModifiedRevDate"))}</p>
                  </label>
                </div>
                <div className="dochub-create-doc-form__item">
                  <label>
                    <span className="dochub-create-doc-form__item__label">
                      From Rev
                    </span>
                    <input
                      {...register("fromOriginalRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{formatTime(watch("fromOriginalRevDate"))}</p>
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
                      {...register("toOwner")}
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
                      {...register("toRepo")}
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
                      {...register("toBranch")}
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
                      {...register("toPath")}
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
                      {...register("toOriginalRev")}
                      className="input"
                      type="text"
                      style={{ width: "100%" }}
                    />
                    <p>{formatTime(watch("toOriginalRevDate"))}</p>
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

export default CreateDoc;
