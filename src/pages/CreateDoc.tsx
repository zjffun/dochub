import { useState } from "react";
import { createDoc } from "../api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import pathInfo from "../utils/pathInfo";

import "./CreateDoc.scss";

function RelationList() {
  const { docPath } = pathInfo();

  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const valid = form.checkValidity();

    if (!valid) {
      return;
    }

    const formData = new FormData(form);
    const postData = {
      path: `${docPath}/${formData.get("path")}`,
      originalUrl: formData.get("originalUrl"),
      translatedUrl: formData.get("translatedUrl"),
    };

    console.log("CreateDoc.tsx:29", postData);

    setLoading(true);

    // createDoc(postData)
    //   .then((data) => {})
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }

  return (
    <>
      <Header></Header>
      <div className="dochub-create-doc-container">
        <form onSubmit={handleSubmit} className="dochub-create-doc-form">
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Doc Path
              </span>
              <span>
                <span>{docPath}/</span>
                <input name="path" type="text" />
              </span>
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Original URL
              </span>
              <input name="originalUrl" type="text" />
            </label>
          </div>
          <div className="dochub-create-doc-form__item">
            <label>
              <span className="dochub-create-doc-form__item__label">
                Translated URL
              </span>
              <input name="translatedUrl" type="text" />
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
