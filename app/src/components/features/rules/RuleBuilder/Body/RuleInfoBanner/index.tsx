import React from "react";
import { Alert, Col, Row, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./ruleInfoBanner.css";

const ruleInfoBannerContent: Record<string, { title: string; description: string; appMode?: string[] }> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: {
    appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
    title: "Delay is capped automatically to avoid browsing performance degradation.",
    description: `For XHR/Fetch, max delay is ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_XHR}ms & for other resources (JS, CSS, Images etc), max delay is ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_NON_XHR}ms.`,
  },
};

const RuleInfoBanner: React.FC<{ ruleType: string; appMode: string }> = ({ ruleType, appMode }) => {
  if (!(ruleType in ruleInfoBannerContent)) return null;

  // if appMode is not present in ruleInfoBannerContent then show for all app modes
  if (!ruleInfoBannerContent[ruleType]?.appMode?.includes(appMode)) return null;

  return (
    <Row className="rule-info-banner-container">
      <Col span={24}>
        <Alert
          className="rule-info-banner"
          message={
            <>
              <Typography.Text className="rule-info-banner-text">
                {ruleInfoBannerContent[ruleType].title}
              </Typography.Text>
              <br />
              <Typography.Text className="rule-info-banner-text">
                {ruleInfoBannerContent[ruleType].description}
              </Typography.Text>
            </>
          }
          icon={
            <div className="rule-info-banner-icon">
              <InfoCircleOutlined />
            </div>
          }
          showIcon
          closable
        />
      </Col>
    </Row>
  );
};

export default RuleInfoBanner;
