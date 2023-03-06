import React from "react";
import { Col, notification, Row, Space } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//@ts-ignore
import { ReactComponent as QuestionMarkIcon } from "assets/icons/rule-types/queryparam.svg";
import { RQButton } from "lib/design-system/components";
import "./ruleInfoDialog.css";

const ruleInfoDialogContent: Record<
  string,
  { title: string; description: string; appMode?: string[] }
> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: {
    title:
      "Modified response body and status will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to the technical limitions of the browser.",
    appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: {
    title:
      "Modified request body will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to the technical limitions of the browser.",
    appMode: [GLOBAL_CONSTANTS.APP_MODES.DESKTOP],
  },
};

const ruleInfoDialog = (ruleType: string, appMode: string): void => {
  if (!(ruleType in ruleInfoDialogContent)) return;
  // if appMode is not present in <ruleInfoDialogContent> then show for all app modes
  if (
    ruleInfoDialogContent[ruleType].appMode?.length > 0 &&
    !ruleInfoDialogContent[ruleType].appMode.includes(appMode)
  )
    return;

  notification.open({
    message: <MessageComponent ruleType={ruleType} />,
    top: 60,
    className: "rule-info-dialog-box",
    duration: 0,
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
          {ruleInfoDialogContent[ruleType].title}
        </span>
      </Col>
      <Col>
        <span className="rule-info-dialog-description">
          {ruleInfoDialogContent[ruleType].description}
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
