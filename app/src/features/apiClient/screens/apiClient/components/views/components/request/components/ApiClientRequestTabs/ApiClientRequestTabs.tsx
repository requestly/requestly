import React from "react";
import { Tabs, TabsProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { useDeepLinkState } from "hooks";
import "./apiClientRequestTabs.scss";

interface Props extends TabsProps {
  requestId: RQAPI.ApiRecord["id"];
}

export const ApiClientRequestTabs: React.FC<Props> = ({ requestId, ...props }) => {
  const [selectedTab, setSelectedTab] = useDeepLinkState({ tab: props.defaultActiveKey });

  return (
    <Tabs
      {...props}
      className={`api-request-tabs active-tab-${selectedTab.tab ?? props.defaultActiveKey} ${props.className || ""}`}
      activeKey={selectedTab.tab}
      onChange={(tab) => {
        setSelectedTab({ tab: tab });
      }}
      size="small"
      moreIcon={null}
      tabBarExtraContent={props.tabBarExtraContent}
    />
  );
};
