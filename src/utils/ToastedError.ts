import { toast } from "react-toastify";

export default function ToastedError(errStr: string): Error {
  toast.error(errStr);
  return Error(errStr);
}
