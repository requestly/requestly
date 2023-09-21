import React from "react";
import { Button, Col, Row, Typography } from "antd";
import config from "../../../config";
import { icons } from "../../ruleTypeIcons";
import "./onboardingScreen.css";
import { EVENT, sendEvent } from "../../events";

interface RuleSelectorProps {
  editorLink: string;
  icon: React.ReactNode;
  title: string;
}

const ruleList = [
  {
    editorLink: `${config.WEB_URL}/rules/editor/create/Redirect?source=popup`,
    icon: icons.Redirect,
    title: "Redirect requests",
  },
  {
    editorLink: `${config.WEB_URL}/rules/editor/create/Response?source=popup`,
    icon: icons.Response,
    title: "Modify API responses",
  },
  {
    editorLink: `${config.WEB_URL}/rules/editor/create/Headers?source=popup`,
    icon: icons.Headers,
    title: "Modify headers",
  },
  {
    editorLink: `${config.WEB_URL}/rules/editor/create/Script?source=popup`,
    icon: icons.Script,
    title: "Insert scripts",
  },
];

const RuleSelector: React.FC<RuleSelectorProps> = (props) => {
  return (
    <Col
      className="rule-selector-col"
      onClick={() => {
        window.open(props.editorLink, "_blank");
      }}
    >
      <Button className="rule-icon" icon={<span className="icon-wrapper">{props.icon}</span>} />
      <Typography.Text className="rule-selector-text">{props.title}</Typography.Text>
    </Col>
  );
};

const OnboardingScreen: React.FC = () => {
  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div>
          <Typography.Title level={4} className="onboarding-header-title">
            Welcome to Requestly! 👋
          </Typography.Title>
          <Typography.Text type="secondary">Intercept and modify HTTP(s) requests</Typography.Text>
        </div>
      </div>

      <Row align="middle" className="rule-selector" wrap={false}>
        {ruleList.map((rule) => (
          <RuleSelector key={rule.title} {...rule} />
        ))}
      </Row>

      <div className="onboarding-footer">
        <Button
          block
          type="text"
          className="view-all-link"
          onClick={() => {
            sendEvent(EVENT.EXTENSION_VIEW_ALL_MODIFICATIONS_CLICKED);
            window.open(`${config.WEB_URL}/rules/create?source=popup`, "_blank");
          }}
        >
          <Typography.Text>View all modification options</Typography.Text>
        </Button>
        <Button
          className="watch-demo-link"
          type="text"
          onClick={() => {
            sendEvent(EVENT.EXTENSION_WATCH_DEMO_VIDEO_CLICKED);
            window.open(`${config.WEB_URL}/rules/my-rules?source=popup`, "_blank");
          }}
        >
          <Typography.Text type="secondary" underline>
            Watch demo video
          </Typography.Text>
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
