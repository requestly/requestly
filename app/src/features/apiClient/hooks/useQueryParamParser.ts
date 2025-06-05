import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { KeyValuePair, RQAPI } from "../types";
import { extractQueryParams } from "../screens/apiClient/utils";

interface QueryParamParserProps {
  entry: RQAPI.Entry;
}

export const useQueryParamParser = ({ entry }: QueryParamParserProps) => {
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const isSyncComplete = useRef(false);

  const syncQueryParams = useCallback(() => {
    if (isSyncComplete.current) return;
    const { request } = entry;
    const paramsFromUrl = extractQueryParams(request.url);
    const paramsObject = entry.request.queryParams;

    const keysFromObject = new Set(paramsObject.map((param) => param.key));

    const finalParams: KeyValuePair[] = [...paramsObject];

    for (const param of paramsFromUrl) {
      if (!keysFromObject.has(param.key)) {
        finalParams.push({
          key: param.key,
          value: param.value,
          isEnabled: true,
          id: Date.now(),
        });
      }
    }

    setQueryParams(finalParams);
    isSyncComplete.current = true;
  }, [entry]);

  useLayoutEffect(() => {
    syncQueryParams();
  }, [syncQueryParams]);

  return { queryParams, setQueryParams };
};
