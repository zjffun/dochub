import { Link } from "react-router-dom";

import "./Paths.scss";

function Header({ paths }: { paths: string }) {
  const pathSegments = paths.split("/").filter((p) => Boolean(p));

  const showingPath = pathSegments.map((p, i) => {
    return {
      pathSegment: p,
      path: `/${pathSegments.slice(0, i + 1).join("/")}`,
    };
  });

  return (
    <div className="dochub-doc-paths">
      {showingPath.map(({ pathSegment, path }, i) => {
        return (
          <span key={path}>
            <Link to={path}>{pathSegment}</Link>
            {i === showingPath.length - 1 ? null : (
              <span className="dochub-doc-paths__separator">/</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default Header;
