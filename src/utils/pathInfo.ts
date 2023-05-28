import { useMemo } from "react";
import logger from "./logger";

export default function usePathInfo({ typeLength = 1 } = {}) {
  const pathname = window.location.pathname;

  const pathInfo = useMemo(() => {
    const paths = pathname.split("/");

    const type = paths.slice(1, typeLength + 1).join("/");
    const docPath = `/${paths.slice(typeLength + 1).join("/")}`;

    const pathInfo = { pathname, type, docPath };

    logger.debug("usePathInfo result", pathInfo);

    return pathInfo;
  }, [pathname, typeLength]);

  return pathInfo;
}
