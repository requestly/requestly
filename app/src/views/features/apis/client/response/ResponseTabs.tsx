import { Tabs, TabsProps } from "antd";
import React, { memo, useMemo } from "react";
import ResponseBody from "./ResponseBody";
import { RQAPI } from "../../types";
import ResponseHeaders from "./ResponseHeaders";
import StatusLine from "./StatusLine";

interface Props {
  response: RQAPI.Response;
}

enum Tab {
  BODY = "body",
  HEADERS = "headers",
}

const ResponseTabs: React.FC<Props> = ({ response }) => {
  const contentTypeHeader = useMemo(() => {
    return response.headers.find((header) => header.key.toLowerCase() === "content-type")?.value;
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

  return (
    <Tabs
      className="api-response-tabs"
      defaultActiveKey={Tab.BODY}
      items={tabItems}
      size="small"
      tabBarExtraContent={<StatusLine response={response} />}
    />
  );
};

export default memo(ResponseTabs);
