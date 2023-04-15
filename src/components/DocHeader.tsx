import { Link } from "react-router-dom";
import "./DocHeader.scss";
import Paths from "./Paths";

function DocHeader({ pathname }: { pathname: string }) {
  return (
    <section className="dochub-component-doc-header">
      <Paths paths={pathname}></Paths>
      <div
        style={{
          flex: "1 1 auto",
        }}
      ></div>
      <Link className="btn btn-primary" to={`/new${pathname}`}>
        Add doc
      </Link>
    </section>
  );
}

export default DocHeader;
