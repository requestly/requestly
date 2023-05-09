import { Tabs, TabsProps } from "antd";
import React, { memo, useCallback, useMemo } from "react";
import ResponseBody from "./ResponseBody";
import { RQAPI } from "../../types";
import ResponseHeaders from "./ResponseHeaders";
import StatusLine from "./StatusLine";
import "./responseTabs.scss";
import { trackResponseHeadersViewed } from "modules/analytics/events/features/apiClient";
import { getContentTypeFromResponseHeaders } from "../../apiUtils";

interface Props {
  response: RQAPI.Response;
}

enum Tab {
  BODY = "body",
  HEADERS = "headers",
}

const ResponseTabs: React.FC<Props> = ({ response }) => {
  const contentTypeHeader = useMemo(() => {
    return getContentTypeFromResponseHeaders(response.headers);
  }, [response.headers]);

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: Tab.BODY,
        label: "Response body",
        children: <ResponseBody responseText={response.body} contentTypeHeader={contentTypeHeader} />,
      },
      {
        key: Tab.HEADERS,
        label: "Headers",
        children: <ResponseHeaders headers={response.headers} />,
      },
    ],
    [contentTypeHeader, response]
  );

  const onTabChange = useCallback((tab: Tab) => {
    if (tab === Tab.HEADERS) {
      trackResponseHeadersViewed();
    }
  }, []);

  return (
    <Tabs
      className="api-response-tabs"
      defaultActiveKey={Tab.BODY}
      items={tabItems}
      size="small"
      tabBarExtraContent={<StatusLine response={response} />}
      onChange={onTabChange}
    />
  );
};

export default memo(ResponseTabs);
