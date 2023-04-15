import { MutableRefObject, useRef } from "react";

export default function useCurrentRef<T>(currentValue: T): MutableRefObject<T> {
  const ref = useRef<T>(currentValue);
  ref.current = currentValue;
  return ref;
}
