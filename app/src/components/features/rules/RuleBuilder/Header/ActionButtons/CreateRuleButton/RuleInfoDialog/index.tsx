import React, { useMemo } from "react";
import { Col, notification, Row, Space } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//@ts-ignore
import { ReactComponent as QuestionMarkIcon } from "assets/icons/question-mark.svg";
import { RQButton } from "lib/design-system/components";
import "./ruleInfoDialog.css";

interface RuleInfoDialogContent {
  title: string;
  description: string;
  readMoreLink?: string;
  appMode?: string[];
}

const ruleInfoDialogContent: Record<string, RuleInfoDialogContent> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: {
    title: "Modified response body and status will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to technical limitions of the browser.",
    readMoreLink: "https://docs.requestly.io/browser-extension/chrome/http-modifications/response-rule",
    appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: {
    title: "Modified request body will not be visible in browser network dev tools.",
    description:
      "The rule will be executed correctly but cannot be monitored in dev tools due to technical limitions of the browser.",
    readMoreLink: "https://docs.requestly.io/desktop-app/mac/http-modifications/request-body-rule",
    appMode: [GLOBAL_CONSTANTS.APP_MODES.DESKTOP],
  },
};

const ruleInfoDialog = (ruleType: string, appMode: string): void => {
  if (!(ruleType in ruleInfoDialogContent)) return;
  // if appMode is not present in <ruleInfoDialogContent> then show for all app modes
  if (ruleInfoDialogContent[ruleType].appMode?.length > 0 && !ruleInfoDialogContent[ruleType].appMode.includes(appMode))
    return;

  notification.open({
    message: <MessageComponent ruleType={ruleType} />,
    top: 110,
    className: "rule-info-dialog-box",
    duration: 0,
    closeIcon: <></>,
  });
};

const MessageComponent: React.FC<{ ruleType: string }> = ({ ruleType }) => {
  const ruleInfo = useMemo(() => ruleInfoDialogContent[ruleType], [ruleType]);

  return (
    <Row className="rule-info-dialog-container">
      <Col>
        <QuestionMarkIcon className="rule-info-dialog-icon" />
      </Col>
      <Col>
        <span className="rule-info-dialog-title">{ruleInfo.title}</span>
      </Col>
      <Col>
        <span className="rule-info-dialog-description">{ruleInfo.description}</span>
      </Col>
      <Col className="rule-info-dialog-btn">
        <Space>
          <RQButton type="ghost" onClick={() => notification.destroy()}>
            Close
          </RQButton>
          {ruleInfoDialogContent[ruleType].readMoreLink ? (
            <RQButton type="default" href={ruleInfo.readMoreLink} target="__blank">
              Read More
            </RQButton>
          ) : null}
        </Space>
      </Col>
    </Row>
  );
};

export default ruleInfoDialog;
