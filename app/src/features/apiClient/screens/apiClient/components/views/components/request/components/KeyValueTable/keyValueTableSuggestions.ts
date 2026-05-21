import { KeyValueFormType, type KeyValuePair } from "features/apiClient/types";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";

export const getKeyValueTableSuggestions = (tableType: string | undefined, dataIndex: keyof KeyValuePair) => {
  if (tableType === KeyValueFormType.HEADERS && dataIndex === "key") {
    return HEADER_SUGGESTIONS.Request;
  }

  return undefined;
};
