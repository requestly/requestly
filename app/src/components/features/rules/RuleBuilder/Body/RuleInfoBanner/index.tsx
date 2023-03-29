import React from "react";
import { Alert, Col, Row, Typography } from "antd";
//@ts-ignore
import { ReactComponent as QuestionMarkIcon } from "assets/icons/question-mark.svg";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { RedirectDestinationType } from "types/rules";
import "./ruleInfoBanner.css";

const ruleInfoBannerContent: Record<
  string,
  {
    title: string;
    description?: string;
    appMode?: string[];
    closable: boolean;
    showBanner?: (ruleData?: any) => boolean;
  }
> = {
  [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: {
    title:
      "Delay is capped automatically to avoid browsing performance degradation.",
    description: `For XHR/Fetch, max delay is ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_XHR}ms & for other resources (JS, CSS, Images etc), max delay is ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_NON_XHR}ms.`,
    closable: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: {
    title:
      "This rule cannot be executed using Extension because the request redirects to a local file that cannot be accessed by the browser. Use Desktop App instead!",
    appMode: [
      GLOBAL_CONSTANTS.APP_MODES.EXTENSION,
      GLOBAL_CONSTANTS.APP_MODES.REMOTE,
    ],
    closable: false,
    showBanner: (ruleData) => {
      const pairs = ruleData.pairs;
      for (const pair of pairs) {
        if (pair.destinationType === RedirectDestinationType.MAP_LOCAL) {
          return true;
        }
      }
      return false;
    },
  },
};

const RuleInfoBanner: React.FC<{
  ruleType: string;
  appMode: string;
  ruleData: any;
}> = ({ ruleType, appMode, ruleData }) => {
  if (!(ruleType in ruleInfoBannerContent)) return null;
  // if appMode is not present in <ruleInfoBannerContent> then show for all app modes
  if (
    ruleInfoBannerContent[ruleType].appMode?.length > 0 &&
    !ruleInfoBannerContent[ruleType].appMode.includes(appMode)
  )
    return null;

  return (
    <>
      {ruleInfoBannerContent[ruleType].showBanner?.(ruleData) ||
      !ruleInfoBannerContent[ruleType].showBanner ? (
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
                  <QuestionMarkIcon />
                </div>
              }
              showIcon
              closable={ruleInfoBannerContent[ruleType].closable}
            />
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default RuleInfoBanner;
