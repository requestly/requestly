import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const useDeepLinkState = <T = Record<string, string>>(
  defaultValues: T
): [T, (updatedValues: Partial<T>) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (params: Partial<T>) => {
      try {
        const prevParams: Record<string, string> = {};
        Object.entries(searchParams).forEach(([key, value]) => {
          prevParams[key] = value;
        });

        const updatedParams = { ...prevParams, ...params };

        const newParams = new URLSearchParams(searchParams);
        Object.entries(updatedParams).forEach(([key, value]) => {
          newParams.set(key, value);
        });
        // Preserve the existing pathname
        setSearchParams(newParams, {
          replace: true,
          state: { path: window.location.pathname },
        });
      } catch (error) {
        // NOOP
      }
    },
    [searchParams, setSearchParams]
  );

  const params: T = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });

    return result as T;
  }, [searchParams]);

  return [params, updateParams];
};
