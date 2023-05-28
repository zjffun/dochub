import { Link } from "react-router-dom";
import { useStoreContext } from "../store";
import Paths from "./Paths";

import "./DocHeader.scss";

function DocHeader({ docPath }: { docPath: string }) {
  const { hasWritePermission } = useStoreContext();

  return (
    <section className="dochub-component-doc-header">
      <Paths paths={docPath}></Paths>
      <div
        style={{
          flex: "1 1 auto",
        }}
      ></div>
      {hasWritePermission && (
        <>
          <Link
            className="btn btn-primary"
            style={{
              marginRight: "0.5rem",
            }}
            to={`/new/doc${docPath}`}
          >
            Add doc
          </Link>
          <Link className="btn btn-primary" to={`/new/doc/batch${docPath}`}>
            Batch add doc
          </Link>
        </>
      )}
    </section>
  );
}

export default DocHeader;
