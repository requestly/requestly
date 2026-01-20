import { Col, Row, Typography } from "antd";
import { getAppFlavour } from "utils/AppUtils";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { CompaniesLogoBanner } from "../CompaniesLogoBanner";
import "./index.scss";

const requestlyFeatures = [
  "Work from anywhere - Sync Requestly rules & other configurations across devices",
  "Access your organization's resources, including team workspaces, shared rules and mocks.",
  "Use All features like HTTP Sessions, API Mocks, Overriding API Responses, etc.",
  "Join a Community trusted by over 200,000 customers worldwide from over 10,000",
  "It's Free!",
];

const sessionBearFeatures = [
  "Unlimited Sessions",
  "Collaborate with teammates using Team Workspaces",
  "Work from anywhere - Sync Sessions and other configurations across devices",
  "Join a Community trusted by over 200,000 customers worldwide from over 10,000",
  "It's Free!",
];

export const OnboardingAuthBanner = () => {
  const appFlavour = getAppFlavour();

  return (
    <Col className="auth-banner">
      <Typography.Title level={3}>
        {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? (
          <>
            Let’s build a{" "}
            <span className="banner-title-highlight">
              bug-free <img src={"/assets/media/common/yellow-highlight.svg"} alt="highlight" />
            </span>{" "}
            product
          </>
        ) : (
          <span className="banner-title-highlight">
            Why Sign Up ? <img src={"/assets/media/common/yellow-highlight.svg"} alt="highlight" />
          </span>
        )}
      </Typography.Title>
      <div className="mt-20">
        {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR
          ? sessionBearFeatures.map((feature) => (
              <Row className="banner-premium-feature-list-item">
                <MdCheck />
                <span className="feature-text">{feature}</span>
              </Row>
            ))
          : requestlyFeatures.map((feature) => (
              <Row className="banner-premium-feature-list-item">
                <MdCheck />
                <span className="feature-text">{feature}</span>
              </Row>
            ))}
      </div>
      <CompaniesLogoBanner />
    </Col>
  );
};
