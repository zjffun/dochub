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
        <Link className="btn btn-primary" to={`/new${docPath}`}>
          Add doc
        </Link>
      )}
    </section>
  );
}

export default DocHeader;
