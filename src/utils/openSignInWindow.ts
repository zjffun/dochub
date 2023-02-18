import { signInUrl } from "../config";

export default function openSignInWindow() {
  const left = window.screen.width / 2 - 300;
  const top = window.screen.height / 2 - 300;
  window.open(
    signInUrl,
    "_blank",
    `popup=true, width=600, height=600, left=${left}, top=${top}`
  );
}
