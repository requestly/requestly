import React, { useMemo, useState } from "react";
import { Badge, Tabs } from "antd";
import ExecutedRules from "../ExecutedRules";
import PinnedRecords from "../PinnedRecords";
import RecentRecords from "../RecentRecords";
import { PushpinFilled, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import "./popupTabs.css";
import { EVENT, sendEvent } from "../../events";

enum PopupTabKey {
  PINNED_RULES = "pinned_rules",
  RECENTLY_USED = "recently_used",
  EXECUTED_RULES = "executed_rules",
}

const PopupTabs: React.FC = () => {
  const [executedRulesCount, setExecutedRulesCount] = useState(0);
  const tabItems = useMemo(() => {
    return [
      {
        key: PopupTabKey.PINNED_RULES,
        label: (
          <span>
            <PushpinFilled rotate={-45} />
            Pinned rules
          </span>
        ),
        children: <PinnedRecords />,
      },
      {
        key: PopupTabKey.RECENTLY_USED,
        label: (
          <span>
            <ClockCircleOutlined />
            Recently used
          </span>
        ),
        children: <RecentRecords />,
      },
      {
        key: PopupTabKey.EXECUTED_RULES,
        label: (
          <span>
            <CheckCircleOutlined />
            Executed rules
            <Badge size="small" count={executedRulesCount} className="popup-tab-badge" />
          </span>
        ),
        children: <ExecutedRules setExecutedRulesCount={setExecutedRulesCount} />,
      },
    ];
  }, [executedRulesCount]);

  return (
    <Tabs
      size="middle"
      items={tabItems}
      defaultActiveKey={PopupTabKey.PINNED_RULES}
      className="popup-tabs"
      destroyInactiveTabPane
      onChange={(key) => sendEvent(EVENT.POPUP_TAB_SELECTED, { tab: key })}
    />
  );
};

export default PopupTabs;
