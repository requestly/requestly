import React, { useMemo } from "react";
import { Alert, Col, Row, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import LINKS from "config/constants/sub/links";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";
import "./ruleInfoBanner.css";

const RuleInfoBanner: React.FC<{ ruleType: string; appMode: string }> = ({ ruleType, appMode }) => {
  const ruleInfoBannerContent: Record<
    string,
    { title: React.ReactNode; description: React.ReactNode; appMode?: string[] }
  > = useMemo(
    () => ({
      [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: {
        appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
        title: "On browser extension, delay is capped automatically to avoid browsing performance degradation.",
        description: (
          <div>
            For XHR/Fetch, max delay is {GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_XHR} ms & for other
            resources (JS, CSS, Images etc), max delay is{" "}
            {GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_NON_XHR} ms.
            <br />
            You can use{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={LINKS.REQUESTLY_DESKTOP_APP}
              onClick={() => trackDesktopAppPromoClicked("delay_rule_editor")}
            >
              Desktop App
            </a>{" "}
            which has no such restrictions.
          </div>
        ),
      },
    }),
    []
  );

  if (!(ruleType in ruleInfoBannerContent)) return null;

  if (ruleInfoBannerContent[ruleType]?.appMode && !ruleInfoBannerContent[ruleType]?.appMode?.includes(appMode))
    return null;

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
