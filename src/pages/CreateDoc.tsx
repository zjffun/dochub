// @ts-ignore
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDoc } from "../api";
import {
  getBranchRev,
  getContents,
  getLastOriginalFromRev,
} from "../api/github";
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
      originalFromRev: "",
      originalFromContent: "",
      translatedOwner: data.translatedOwner,
      translatedRepo: data.translatedRepo,
      translatedBranch: data.translatedBranch,
      translatedPath: data.translatedPath,
      translatedRev: "",
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
      await createDoc(postData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  async function handleParseOriginalUrlClick() {
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

  async function handleParseTranslatedUrlClick() {
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

    const { oid, date } = await getBranchRev({
      owner: parsedTranslatedUrl.owner,
      repo: parsedTranslatedUrl.repo,
      branch: parsedTranslatedUrl.branch,
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
                Original Rev
              </span>
              <input {...register("originalRev")} type="text" />
              {watch("originalRevDate")}
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original From Rev
              </span>
              <input {...register("originalFromRev")} type="text" />
            </label>
            {watch("originalFromRevDate")}
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
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated Rev
              </span>
              <input {...register("translatedRev")} type="text" />
              <span>{watch("translatedRevDate")}</span>
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
