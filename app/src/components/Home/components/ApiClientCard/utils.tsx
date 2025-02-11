import { getTabIconFromUrl } from "layouts/TabsLayout/components/TabsLayoutContent/utils";
import { FormatType } from "./types";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import { TabsLayout } from "layouts/TabsLayout";
import { REQUEST_METHOD_COLORS, REQUEST_METHOD_BACKGROUND_COLORS } from "../../../../constants/requestMethodColors";
import PATHS from "config/constants/sub/paths";

const getRequestMethodIcon = (historyItem: RQAPI.Entry) => (
  <p
    className="request-method"
    style={{
      color: REQUEST_METHOD_COLORS[historyItem.request?.method],
      backgroundColor: REQUEST_METHOD_BACKGROUND_COLORS[historyItem.request?.method],
    }}
  >
    {[RequestMethod.OPTIONS, RequestMethod.DELETE].includes(historyItem.request?.method)
      ? historyItem.request?.method.slice(0, 3)
      : historyItem.request?.method}
  </p>
);

const formatContentList = (list: TabsLayout.Tab[] | RQAPI.Entry[], type: FormatType) => {
  return type === FormatType.TABS
    ? (list as TabsLayout.Tab[]).map((item) => ({ ...item, icon: getTabIconFromUrl(item.url) }))
    : (list as RQAPI.Entry[]).map((history) => ({
        id: "history",
        title: history.request.url,
        icon: getRequestMethodIcon(history),
        url: PATHS.API_CLIENT.HISTORY.ABSOLUTE,
        hasUnsavedChanges: false,
        timeStamp: Date.now(),
      }));
};

export const getOptions = (list: TabsLayout.Tab[] | RQAPI.Entry[], type: FormatType) => {
  const bodyTitle = type === FormatType.HISTORY ? "API History" : "Recent Tabs";
  const contentList = formatContentList(list, type);
  return { bodyTitle, contentList, type };
};
