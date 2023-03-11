// @ts-ignore
import GitHub from "github-api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDoc } from "../api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { githubUrl } from "../utils/githubUrl";
import pathInfo from "../utils/pathInfo";

import "./CreateDoc.scss";

function RelationList() {
  const { docPath } = pathInfo();

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
      path: `${docPath}/${data.path}`,
      originalOwner: data.originalOwner,
      originalRepo: data.originalRepo,
      originalBranch: data.originalBranch,
      originalPath: data.originalPath,
      originalRev: "",
      originalContent: "",
      translatedOwner: data.translatedOwner,
      translatedRepo: data.translatedRepo,
      translatedBranch: data.translatedBranch,
      translatedPath: data.translatedPath,
      translatedRev: "",
      translatedContent: "",
    };

    setLoading(true);

    try {
      const token = window.localStorage.getItem("github_token");
      const gh = new GitHub({ token });
      // originalRev
      const originalRepository = gh.getRepo(
        data.originalOwner,
        data.originalRepo
      );
      const originalRevRes = await originalRepository.getBranch(
        data.originalBranch
      );
      const originalRev = originalRevRes.data.commit.sha;
      if (!originalRev) {
        throw new Error("originalRev is empty");
      }
      postData.originalRev = originalRev;

      // translatedRev
      const translatedRepository = gh.getRepo(
        data.translatedOwner,
        data.translatedRepo
      );
      const translatedRevRes = await translatedRepository.getBranch(
        data.translatedBranch
      );
      const translatedRev = translatedRevRes.data.commit.sha;
      if (!translatedRev) {
        throw new Error("translatedRev is empty");
      }
      postData.translatedRev = translatedRev;

      // originalContent
      const originalContentRes = await originalRepository.getContents(
        originalRev,
        data.originalPath,
        true
      );
      const originalContent = originalContentRes.data;
      if (!originalContent) {
        throw new Error("originalContent is empty");
      }
      postData.originalContent = originalContent;

      // translatedContent
      const translatedContentRes = await translatedRepository.getContents(
        translatedRev,
        data.translatedPath,
        true
      );
      const translatedContent = translatedContentRes.data;
      if (!translatedContent) {
        throw new Error("translatedContent is empty");
      }
      postData.translatedContent = translatedContent;

      // create doc
      await createDoc(postData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  function handleParseOriginalUrlClick() {
    const originalUrl = watch("originalUrl");
    const parsedOriginalUrl = githubUrl(originalUrl);
    setValue("originalOwner", parsedOriginalUrl.owner);
    setValue("originalRepo", parsedOriginalUrl.repo);
    setValue("originalBranch", parsedOriginalUrl.branch);
    setValue("originalPath", parsedOriginalUrl.path);
  }

  function handleParseTranslatedUrlClick() {
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
  }

  return (
    <>
      <Header></Header>
      <div className="dochub-create-doc-container">
        <form onSubmit={handleFromSubmit} className="dochub-create-doc-form">
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original URL
              </span>
              <input {...register("originalUrl")} type="text" />
              <button type="button" onClick={handleParseOriginalUrlClick}>
                parse
              </button>
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated URL
              </span>
              <input {...register("translatedUrl")} type="text" />
              <button type="button" onClick={handleParseTranslatedUrlClick}>
                parse
              </button>
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Doc Path
              </span>
              <span>
                <span>{docPath}/</span>
                <input {...register("path", { required: true })} type="text" />
                {errors.path && <span>This field is required</span>}
              </span>
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original Owner
              </span>
              <input {...register("originalOwner")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original Repo
              </span>
              <input {...register("originalRepo")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original Branch
              </span>
              <input {...register("originalBranch")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original Path
              </span>
              <input {...register("originalPath")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated Owner
              </span>
              <input {...register("translatedOwner")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated Repo
              </span>
              <input {...register("translatedRepo")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated Branch
              </span>
              <input {...register("translatedBranch")} type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated Path
              </span>
              <input {...register("translatedPath")} type="text" />
            </label>
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
      <Loading loading={loading}></Loading>
    </>
  );
}

export default RelationList;
