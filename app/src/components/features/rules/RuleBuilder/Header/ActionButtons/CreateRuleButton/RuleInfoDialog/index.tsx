import React from "react";
import { Col, notification, Row, Space } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//@ts-ignore
import { ReactComponent as QuestionMarkIcon } from "assets/icons/rule-types/queryparam.svg";
import { RQButton } from "lib/design-system/components";
import "./ruleInfoDialog.css";

const ruleInfo: Record<string, { title: string; description: string }> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: {
    title:
      "Modified response body and status will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to the technical limitions of the browser.",
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: {
    title:
      "Modified request body will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to the technical limitions of the browser.",
  },
};

const ruleInfoDialog = (ruleType: string): void => {
  if (!(ruleType in ruleInfo)) return;

  notification.open({
    message: <MessageComponent ruleType={ruleType} />,
    top: 60,
    className: "rule-info-dialog-box",
  });
};

const MessageComponent: React.FC<{ ruleType: string }> = ({ ruleType }) => {
  return (
    <Row className="rule-info-dialog-container">
      <Col>
        <QuestionMarkIcon className="rule-info-dialog-icon" />
      </Col>
      <Col>
        <span className="rule-info-dialog-title">
          {ruleInfo[ruleType].title}
        </span>
      </Col>
      <Col>
        <span className="rule-info-dialog-description">
          {ruleInfo[ruleType].description}
        </span>
      </Col>
      <Col className="rule-info-dialog-btn">
        <Space>
          <RQButton type="ghost" onClick={() => notification.destroy()}>
            Close
          </RQButton>
          <RQButton type="default">Read More</RQButton>
        </Space>
      </Col>
    </Row>
  );
};

export default ruleInfoDialog;
