import React, { useMemo, useState } from "react";
import { Badge, Col, Dropdown, Menu, Row, Tabs, Typography } from "antd";
import ExecutedRules from "../ExecutedRules";
import PinnedRecords from "../PinnedRecords";
import RecentRecords from "../RecentRecords";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import ArrowIcon from "../../../../resources/icons/arrowDown.svg";
import { PushpinOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { icons } from "../../ruleTypeIcons";
import { EVENT, sendEvent } from "../../events";
import config from "../../../config";
import "./popupTabs.css";

export enum PopupTabKey {
  PINNED_RULES = "pinned_rules",
  RECENTLY_USED = "recently_used",
  EXECUTED_RULES = "executed_rules",
}

const PopupTabs: React.FC = () => {
  const [executedRulesCount, setExecutedRulesCount] = useState(0);
  const [isRuleDropdownOpen, setIsRuleDropdownOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(PopupTabKey.PINNED_RULES);

  const tabItems = useMemo(() => {
    return [
      {
        key: PopupTabKey.PINNED_RULES,
        label: (
          <span>
            <PushpinOutlined rotate={-45} />
            Pinned rules
          </span>
        ),
        children: <PinnedRecords setActiveTabKey={setActiveTabKey} />,
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

  const handleRulesDropdownItemClick = (url: string) => {
    setIsRuleDropdownOpen(false);
    window.open(url, "_blank");
  };

  const rulesDropdownMenu = useMemo(
    () => (
      <Menu>
        <Menu.Item
          key="modify_response"
          onClick={() => handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Response?source=popup`)}
        >
          {icons.Response}
          <span>Modify API Response</span>
        </Menu.Item>
        <Menu.Item
          key="modify_headers"
          onClick={() => handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Headers?source=popup`)}
        >
          {icons.Headers}
          <span>Modify Headers</span>
        </Menu.Item>
        <Menu.Item
          key="redirect_request"
          onClick={() => handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Redirect?source=popup`)}
        >
          {icons.Redirect}
          <span>Redirect Request</span>
        </Menu.Item>
        <Menu.Item
          key="replace_string"
          onClick={() => handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Replace?source=popup`)}
        >
          {icons.Replace}
          <span>Replace String</span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="other"
          onClick={() => handleRulesDropdownItemClick(`${config.WEB_URL}/rules/create?source=popup`)}
        >
          <Row align="middle" gutter={8} className="more-rules-link-option">
            <Col>View more options</Col>
            <ExternalLinkIcon style={{ color: "var(--white)" }} />
          </Row>
        </Menu.Item>
      </Menu>
    ),
    []
  );

  return (
    <div className="popup-tabs-wrapper">
      <Row justify="space-between" align="middle" className="tabs-header">
        <Typography.Text strong>HTTP rules</Typography.Text>
        <Dropdown
          overlay={rulesDropdownMenu}
          trigger={["click"]}
          onOpenChange={(open) => setIsRuleDropdownOpen(open)}
          overlayClassName="rule-type-dropdown"
        >
          <PrimaryActionButton className="new-rule-dropdown-btn" size="small">
            New rule{" "}
            <ArrowIcon
              className={`new-rule-dropdown-btn-arrow ${isRuleDropdownOpen ? "new-rule-dropdown-btn-arrow-up" : ""}`}
            />
          </PrimaryActionButton>
        </Dropdown>
      </Row>
      <Tabs
        size="middle"
        items={tabItems}
        activeKey={activeTabKey}
        className="popup-tabs"
        destroyInactiveTabPane
        onChange={(key: PopupTabKey) => {
          setActiveTabKey(key);
          sendEvent(EVENT.POPUP_TAB_SELECTED, { tab: key });
        }}
      />
    </div>
  );
};

export default PopupTabs;
