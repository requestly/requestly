import React, { useEffect, useMemo, useState } from "react";
import { Badge, Col, Dropdown, Menu, Row, Tabs, Typography } from "antd";
import ExecutedRules from "../ExecutedRules";
import PinnedRecords from "../PinnedRecords";
import RecentRecords from "../RecentRecords";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import ExternalLinkIcon from "../../../../resources/icons/externalLink.svg";
import ArrowIcon from "../../../../resources/icons/arrowDown.svg";
import { PushpinOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { icons } from "../../ruleTypeIcons";
import { Rule, RuleType } from "../../../types";
import { EVENT, sendEvent } from "../../events";
import config from "../../../config";
import "./popupTabs.css";
import { EXTENSION_MESSAGES } from "../../../constants";

export enum PopupTabKey {
  PINNED_RULES = "pinned_rules",
  RECENTLY_USED = "recently_used",
  EXECUTED_RULES = "executed_rules",
}

const PopupTabs: React.FC<{
  isSessionReplayEnabled: boolean;
}> = ({ isSessionReplayEnabled }) => {
  const [isRuleDropdownOpen, setIsRuleDropdownOpen] = useState(false);
  const [executedRules, setExecutedRules] = useState<Rule[]>([]);
  const [activeTabKey, setActiveTabKey] = useState(PopupTabKey.PINNED_RULES);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([activeTab]) => {
      chrome.runtime.sendMessage(
        {
          tabId: activeTab.id,
          action: EXTENSION_MESSAGES.GET_EXECUTED_RULES,
        },
        (rules) => {
          if (rules.length) {
            setActiveTabKey(PopupTabKey.EXECUTED_RULES);
            setExecutedRules(rules);
          }
        }
      );
    });
  }, []);

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
            <Badge size="small" count={executedRules.length} overflowCount={20} className="popup-tab-badge" />
          </span>
        ),
        children: <ExecutedRules executedRules={executedRules} setExecutedRules={setExecutedRules} />,
      },
    ];
  }, [executedRules]);

  const handleRulesDropdownItemClick = (url: string, ruleType?: RuleType) => {
    if (ruleType) {
      sendEvent(EVENT.RULE_CREATION_WORKFLOW_STARTED, { rule_type: ruleType });
    }

    setIsRuleDropdownOpen(false);
    window.open(url, "_blank");
  };

  const ruleDropdownItemsMap = useMemo(
    () => [
      {
        key: "modify_response",
        children: (
          <>
            {icons.Response}
            <span>Modify API Response</span>
          </>
        ),
        clickHandler: () =>
          handleRulesDropdownItemClick(
            `${config.WEB_URL}/rules/editor/create/Response?source=popup`,
            RuleType.RESPONSE
          ),
      },
      {
        key: "modify_headers",
        children: (
          <>
            {icons.Headers}
            <span>Modify Headers</span>
          </>
        ),
        clickHandler: () =>
          handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Headers?source=popup`, RuleType.HEADERS),
      },
      {
        key: "redirect_request",
        children: (
          <>
            {icons.Redirect}
            <span>Redirect Request</span>
          </>
        ),
        clickHandler: () =>
          handleRulesDropdownItemClick(
            `${config.WEB_URL}/rules/editor/create/Redirect?source=popup`,
            RuleType.REDIRECT
          ),
      },
      {
        key: "replace_string",
        children: (
          <>
            {icons.Replace}
            <span>Replace String</span>
          </>
        ),
        clickHandler: () =>
          handleRulesDropdownItemClick(`${config.WEB_URL}/rules/editor/create/Replace?source=popup`, RuleType.REPLACE),
      },
      { key: "divider" },
      {
        key: "other",
        children: (
          <Row align="middle" gutter={8} className="more-rules-link-option">
            <Col>View more options</Col>
            <ExternalLinkIcon style={{ color: "var(--white)" }} />
          </Row>
        ),
        clickHandler: () => {
          sendEvent(EVENT.EXTENSION_VIEW_ALL_MODIFICATIONS_CLICKED);
          handleRulesDropdownItemClick(`${config.WEB_URL}/rules/create?source=popup`);
        },
      },
    ],
    []
  );

  const ruleDropdownMenu = (
    <Menu>
      {ruleDropdownItemsMap.map((item) =>
        item.key === "divider" ? (
          <Menu.Divider />
        ) : (
          <Menu.Item key={item.key} onClick={item.clickHandler}>
            {item.children}
          </Menu.Item>
        )
      )}
    </Menu>
  );

  return (
    <Col
      className="popup-tabs-wrapper popup-body-card"
      style={{
        maxHeight: isSessionReplayEnabled ? "270px" : "290px",
      }}
    >
      <Row justify="space-between" align="middle" className="tabs-header">
        <Typography.Text strong>HTTP rules</Typography.Text>
        <Dropdown
          overlay={ruleDropdownMenu}
          trigger={["click"]}
          onOpenChange={(open) => setIsRuleDropdownOpen(open)}
          overlayClassName="rule-type-dropdown"
        >
          <PrimaryActionButton
            size="small"
            className="new-rule-dropdown-btn"
            onClick={() => sendEvent(EVENT.NEW_RULE_BUTTON_CLICKED)}
          >
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
        onChange={(key: PopupTabKey) => {
          setActiveTabKey(key);
          sendEvent(EVENT.POPUP_TAB_SELECTED, { tab: key });
        }}
      />
    </Col>
  );
};

export default PopupTabs;
