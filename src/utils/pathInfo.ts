export default function pathInfo() {
  const pathname = window.location.pathname;
  const type = pathname.split("/")[1];
  const docPath = pathname.replace(new RegExp(`^/${type}`), "");

  return { pathname, type, docPath };
}
