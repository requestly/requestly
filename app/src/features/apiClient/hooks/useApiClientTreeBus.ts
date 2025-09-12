import { useMemo } from "react";
import { useApiClientFeatureContext } from "../contexts/meta";
import { ApiClientTreeBus } from "../helpers/apiClientTreeBus/apiClientTreeBus";

export const useApiClientTreeBus = () => {
  const ctx = useApiClientFeatureContext();

  return useMemo(() => ApiClientTreeBus.getInstance(ctx), [ctx]);
};
