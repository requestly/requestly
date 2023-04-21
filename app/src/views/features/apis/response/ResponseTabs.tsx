import { Tabs, TabsProps } from "antd";
import React, { memo, useMemo } from "react";
import ResponseBody from "./ResponseBody";
import { RQAPI } from "../types";

interface Props {
  response: RQAPI.Response;
}

enum Tab {
  BODY = "body",
  HEADERS = "headers",
}

const ResponseTabs: React.FC<Props> = ({ response }) => {
  const formattedTime = useMemo(() => {
    if (response.time) {
      const ms = Math.ceil(response.time);

      if (ms < 1000) {
        return `${ms} ms`;
      }

      return `${(ms / 1000).toFixed(3)} s`;
    }

    return "";
  }, [response.time]);

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: Tab.BODY,
        label: "Response body",
        children: <ResponseBody responseText={response.body} />,
      },
      {
        key: Tab.HEADERS,
        label: "Headers",
        children: <div>To be implemented...</div>,
      },
    ],
    [response]
  );

  return (
    <Tabs
      className="api-response-tabs"
      defaultActiveKey={Tab.BODY}
      items={tabItems}
      size="small"
      tabBarExtraContent={`Time: ${formattedTime}`}
    />
  );
};

export default memo(ResponseTabs);
