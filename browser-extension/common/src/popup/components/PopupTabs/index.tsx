import React, { useMemo, useState } from "react";
import { Badge, Col, Dropdown, Row, Tabs, Typography } from "antd";
import ExecutedRules from "../ExecutedRules";
import PinnedRecords from "../PinnedRecords";
import RecentRecords from "../RecentRecords";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import ArrowIcon from "../../../../resources/icons/arrowDown.svg";
import { PushpinFilled, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { icons } from "../../ruleTypeIcons";
import { EVENT, sendEvent } from "../../events";
import "./popupTabs.css";

enum PopupTabKey {
  PINNED_RULES = "pinned_rules",
  RECENTLY_USED = "recently_used",
  EXECUTED_RULES = "executed_rules",
}

const PopupTabs: React.FC = () => {
  const [executedRulesCount, setExecutedRulesCount] = useState(0);
  const [isRuleDropdownOpen, setIsRuleDropdownOpen] = useState(false);

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

  const ruleDropdownTypes = {
    items: [
      {
        key: "modify_response",
        label: <span>Modify API Response</span>,
        icon: icons.Response,
      },
      {
        key: "modify_headers",
        label: <span>Modify Headers</span>,
        icon: icons.Headers,
      },
      {
        key: "redirect_request",
        label: <span>Redirect Request</span>,
        icon: icons.Redirect,
      },
      {
        key: "replace_string",
        label: <span>Replace String</span>,
        icon: icons.Replace,
      },
      {
        key: "divider",
        type: "divider",
      },
      {
        key: "other",
        label: (
          <Row align="middle" gutter={8} className="more-rules-link-option">
            <Col>View more options</Col>
            <ExternalLinkIcon />
          </Row>
        ),
      },
    ],
  };

  return (
    <div className="popup-tabs-wrapper">
      <Row justify="space-between" align="middle" className="tabs-header">
        <Typography.Text strong>HTTP rules</Typography.Text>
        <Dropdown
          menu={ruleDropdownTypes}
          trigger={["click"]}
          onOpenChange={(open) => setIsRuleDropdownOpen(open)}
          overlayClassName="rule-type-dropdown"
        >
          <PrimaryActionButton className="new-rule-dropdown-btn" size="small">
            New rule{" "}
            <div
              className={`new-rule-dropdown-btn-arrow ${isRuleDropdownOpen ? "new-rule-dropdown-btn-arrow-up" : ""}`}
            >
              <ArrowIcon />
            </div>
          </PrimaryActionButton>
        </Dropdown>
      </Row>
      <Tabs
        size="middle"
        items={tabItems}
        defaultActiveKey={PopupTabKey.PINNED_RULES}
        className="popup-tabs"
        destroyInactiveTabPane
        onChange={(key) => sendEvent(EVENT.POPUP_TAB_SELECTED, { tab: key })}
      />
    </div>
  );
};

export default PopupTabs;
