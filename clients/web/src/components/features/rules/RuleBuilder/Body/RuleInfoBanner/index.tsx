import React, { useMemo } from "react";
import { Alert, Col, Row, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import LINKS from "config/constants/sub/links";
import { trackDesktopAppPromoClicked } from "modules/analytics/events/common/onboarding";
import "./ruleInfoBanner.css";
import { trackMoreInfoClicked } from "modules/analytics/events/misc/moreInfo";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const RuleInfoBanner: React.FC<{ ruleType: string; appMode: string }> = ({ ruleType, appMode }) => {
  const ruleInfoBannerContent: Record<
    string,
    { title: React.ReactNode; description?: React.ReactNode; appMode?: string[] }
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
      [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: {
        appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
        title: (
          <div>
            In the recent version of Chrome v119, the Authorization header is not forwarded when cross-origin fetch
            requests are redirected. Read more about the solution{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://github.com/requestly/requestly/issues/1208#issuecomment-1801505984"}
              onClick={() =>
                trackMoreInfoClicked("authorization_header_not_forwarding", GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT)
              }
            >
              here
            </a>
            .
          </div>
        ),
      },
      [GLOBAL_CONSTANTS.RULE_TYPES.REPLACE]: {
        appMode: [GLOBAL_CONSTANTS.APP_MODES.EXTENSION],
        title: (
          <div>
            In the recent version of Chrome v119, the Authorization header is not forwarded when cross-origin fetch
            requests are redirected. Read more about the solution{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://github.com/requestly/requestly/issues/1208#issuecomment-1801505984"}
              onClick={() =>
                trackMoreInfoClicked("authorization_header_not_forwarding", GLOBAL_CONSTANTS.RULE_TYPES.REPLACE)
              }
            >
              here
            </a>
            .
          </div>
        ),
      },
    }),
    []
  );

  if (!(ruleType in ruleInfoBannerContent)) return null;

  if (ruleInfoBannerContent[ruleType]?.appMode && !ruleInfoBannerContent[ruleType]?.appMode?.includes(appMode))
    return null;

  // Specific case - remove these banners after 1 more release than compatible version
  if (
    [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT, GLOBAL_CONSTANTS.RULE_TYPES.REPLACE].includes(ruleType) &&
    isFeatureCompatible(FEATURES.RELAY_AUTH_HEADER)
  )
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
              {ruleInfoBannerContent[ruleType]?.description && (
                <>
                  <br />
                  <Typography.Text className="rule-info-banner-text">
                    {ruleInfoBannerContent[ruleType].description}
                  </Typography.Text>
                </>
              )}
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
