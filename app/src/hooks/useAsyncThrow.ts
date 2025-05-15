import { useCallback, useState } from "react";

export const useAsyncThrow = () => {
  const [, setErr] = useState();
  return useCallback(
    (e: any) =>
      setErr(() => {
        throw e;
      }),
    [setErr]
  );
};
