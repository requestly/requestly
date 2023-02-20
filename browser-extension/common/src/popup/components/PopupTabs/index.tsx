import React, { useMemo, useState } from "react";
import { Badge, Tabs } from "antd";
import ExecutedRules from "../ExecutedRules";
import PinnedRecords from "../PinnedRecords";
import RecentRecords from "../RecentRecords";
import {
  PushpinFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "./popupTabs.css";

const PopupTabs: React.FC = () => {
  const [executedRulesCount, setExecutedRulesCount] = useState(0);
  const tabItems = useMemo(() => {
    return [
      {
        key: "0",
        label: (
          <span>
            <PushpinFilled rotate={-45} />
            Pinned rules
          </span>
        ),
        children: <PinnedRecords />,
      },
      {
        key: "1",
        label: (
          <span>
            <ClockCircleOutlined />
            Recently used
          </span>
        ),
        children: <RecentRecords />,
      },
      {
        key: "2",
        label: (
          <span>
            <CheckCircleOutlined />
            Executed rules
            <Badge
              size="small"
              count={executedRulesCount}
              className="popup-tab-badge"
            />
          </span>
        ),
        children: (
          <ExecutedRules setExecutedRulesCount={setExecutedRulesCount} />
        ),
      },
    ];
  }, [executedRulesCount]);

  return (
    <Tabs
      size="middle"
      items={tabItems}
      defaultActiveKey="0"
      className="popup-tabs"
      destroyInactiveTabPane
    />
  );
};

export default PopupTabs;
