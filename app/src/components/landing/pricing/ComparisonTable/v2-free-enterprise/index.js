import React, { useCallback, useState } from "react";
import { RQButton } from "lib/design-system/components";
import sessionImg from "../../../../../assets/icons/session.svg";
import rulesImg from "../../../../../assets/icons/http-rules.svg";
// import BuyForTeamsModal from "../../BuyForTeamsModal";
import ContactUsModal from "components/landing/contactUsModal";
import APP_CONSTANTS from "config/constants";
import FeatureRepresentation from "../../FeatureRepresentation";
import GitHubButton from "react-github-btn";
import { PricingFeatures } from "./pricingFeatures";
import { PricingPlans } from "./pricingPlans";
import underlineIcon from "../../../../../assets/img/icons/common/underline.svg";
import "./index.css";
import { trackViewGithubClicked } from "modules/analytics/events/misc/business";
import StripeClimateBadge from "../../../../../assets/images/pages/pricing-page/Stripe-Climate-Badge.svg";
import { Col, Row, Switch, Tag } from "antd";
import EnterpriseBanner from "./EnterpriseBanner";
import { redirectToCheckout } from "utils/RedirectionUtils";
import WorkspaceDropdown from "./WorkspaceDropdown";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getPlanNameFromId } from "utils/PremiumUtils";

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

const FreeAndEnterprisePlanTable = () => {
  const user = useSelector(getUserAuthDetails);

  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const [product, setProduct] = useState(APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES);
  const [duration, setDuration] = useState(APP_CONSTANTS.PRICING.DURATION.ANNUALLY);
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);

  // const useRQwith = ["Web browsers & desktop apps", "Android & iOS", "Selenium & Cypress"];

  const renderButtonsForPlans = useCallback(
    (planName) => {
      const isUserPremium = user?.details?.isPremium;
      const userPlanName = user?.details?.planDetails?.planName;
      const userPlanType = user?.details?.planDetails?.type;
      const userExpiredPlanName =
        user?.details?.planDetails?.status !== "active" ? getPlanNameFromId(user?.details?.planDetails?.planId) : null;
      const isSelectedWorkspacePremium = workspaceToUpgrade?.subscriptionStatus === "active";
      const isPrivateWorksapceSelected = workspaceToUpgrade?.id === PRIVATE_WORKSPACE.id;

      if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE) {
        return (
          <>
            <RQButton onClick={() => (window.location.href = "/")} type="primary">
              Use now
            </RQButton>
            {!isUserPremium && <Tag className="current-plan">Current Plan</Tag>}
          </>
        );
      }

      if (isUserPremium) {
        if (userPlanType === "team") {
          if (isPrivateWorksapceSelected || !isSelectedWorkspacePremium) {
            return (
              <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
                Contact us
              </RQButton>
            );
          }
        } else {
          if (!isPrivateWorksapceSelected) {
            return (
              <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
                Contact us
              </RQButton>
            );
          }
        }
      } else {
        if (userExpiredPlanName === planName) {
          if (
            (userPlanType === "individual" && isPrivateWorksapceSelected) ||
            (userPlanType === "team" && !isPrivateWorksapceSelected)
          ) {
            return (
              <>
                <RQButton
                  onClick={() =>
                    redirectToCheckout({
                      mode: isPrivateWorksapceSelected ? "individual" : "team",
                      planName: planName,
                      duration: duration,
                      quantity: workspaceToUpgrade.accessCount,
                      teamId: isPrivateWorksapceSelected ? null : workspaceToUpgrade?.id,
                    })
                  }
                  type="primary"
                >
                  Renew
                </RQButton>
                {<Tag className="current-plan">Expired</Tag>}
              </>
            );
          }
        }
      }

      if (product === APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY) {
        if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE) {
          return (
            <>
              <RQButton onClick={() => (window.location.href = "/")} type="primary">
                Use now
              </RQButton>
              <Tag className="current-plan">Current Plan</Tag>
            </>
          );
        }

        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      if (isUserPremium && (isSelectedWorkspacePremium || isPrivateWorksapceSelected) && planName === userPlanName) {
        return (
          <RQButton disabled type="primary">
            Current Plan
          </RQButton>
        );
      }

      return (
        <RQButton
          onClick={() =>
            redirectToCheckout({
              mode: isPrivateWorksapceSelected ? "individual" : "team",
              planName: planName,
              duration: duration,
              quantity: workspaceToUpgrade.accessCount,
              teamId: isPrivateWorksapceSelected ? null : workspaceToUpgrade.id,
            })
          }
          disabled={isUserPremium && userPlanName === APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL}
          type="primary"
        >
          Upgrade now
        </RQButton>
      );
    },
    [
      duration,
      product,
      user?.details?.isPremium,
      user?.details?.planDetails?.planId,
      user?.details?.planDetails?.planName,
      user?.details?.planDetails?.status,
      user?.details?.planDetails?.type,
      workspaceToUpgrade,
    ]
  );

  return (
    <>
      <div className="pricing-table-wrapper">
        <div className="text-center margin-bottom-one">
          <Switch
            size="small"
            checked={duration === APP_CONSTANTS.PRICING.DURATION.ANNUALLY}
            onChange={(checked) => {
              if (checked) {
                setDuration(APP_CONSTANTS.PRICING.DURATION.ANNUALLY);
              } else {
                setDuration(APP_CONSTANTS.PRICING.DURATION.MONTHLY);
              }
            }}
          />
          <span>{"  "}Annual pricing (save 20%)</span>
        </div>
        <WorkspaceDropdown workspaceToUpgrade={workspaceToUpgrade} setWorkspaceToUpgrade={setWorkspaceToUpgrade} />
        <Row className="pricing-table-product-wrapper" align={"middle"} justify={"center"}>
          {/* <div className="pricing-table-product-wrapper"> */}
          <Col className="pricing-table-product-view" xs={24} lg={6}>
            <Row>
              <Col xs={8} sm={8} lg={24}>
                <h1>Products</h1>
              </Col>
              <Col
                xs={8}
                sm={8}
                lg={24}
                className={`pricing-table-product-view-item ${
                  product === APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES && "active"
                }`}
                onClick={() => {
                  setProduct(APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES);
                }}
              >
                <div className="pricing-table-product-view-icon">
                  <img src={rulesImg} alt="rules" />
                </div>
                <div className="pricing-table-product-view-para">
                  <h3>HTTP Rules</h3>
                  <p>
                    Intercept & Modify HTTP Requests & Responses. Redirect URLs, Modify Headers, API Request/Response
                    Body, etc
                  </p>
                </div>
              </Col>
              <Col
                xs={8}
                sm={8}
                lg={24}
                className={`pricing-table-product-view-item ${
                  product === APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY && "active"
                }`}
                onClick={() => {
                  setProduct(APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY);
                }}
              >
                <div className="pricing-table-product-view-icon">
                  <img src={sessionImg} alt="session replay" />
                </div>
                <div className="pricing-table-product-view-para">
                  <h3>Session Replay</h3>
                  <p>Capture Screen, mouse movement, network, console and more of any browser session</p>
                </div>
              </Col>
            </Row>
          </Col>
          <Col className="pricing-table-row" xs={24} lg={18}>
            <Row gutter={[8, 8]} style={{ flex: 1 }}>
              {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => (
                <Col xs={24} md={8} className="pricing-table-col" key={planName}>
                  <div className="pricing-col-header">
                    <p className="text-gray plan-for">{planDetails.heading}</p>
                    <div className="header text-left">
                      <span style={{ textTransform: "capitalize" }}>{planDetails.planTitle}</span>
                    </div>
                    <div className="text-gray text-left price-container">
                      <span className="price">
                        $
                        {duration === APP_CONSTANTS.PRICING.DURATION.ANNUALLY
                          ? PricingPlans[planName].plans[duration]?.usd?.price / 12
                          : PricingPlans[planName].plans[duration]?.usd?.price}
                      </span>{" "}
                      {workspaceToUpgrade.id === PRIVATE_WORKSPACE.id ? "per month" : "per user/month"}
                      {duration === APP_CONSTANTS.PRICING.DURATION.ANNUALLY && ", billed annually"}
                    </div>
                    {renderButtonsForPlans(planName)}
                  </div>
                  {planName !== APP_CONSTANTS.PRICING.PLAN_NAMES.FREE &&
                    product !== APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY && (
                      <div className="pro-basic-feature-title text-left">
                        <span>
                          Everything <img src={underlineIcon} alt="highlight" />
                        </span>{" "}
                        in {planName === APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC ? "Free" : "Basic"} plan, and
                      </div>
                    )}
                  <div>
                    {planDetails.features.map((feature, index) => (
                      <FeatureRepresentation key={index} title={feature.title} enabled={feature.enabled} />
                    ))}
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
          {/* </div> */}
        </Row>
        <EnterpriseBanner openContactUsModal={() => setIsContactUsModalOpen(true)} />
        <div className="note-container text-gray text-center">
          <span>
            <img alt="StripeClimateBadge" src={StripeClimateBadge} style={{ height: "1em" }} /> At Requestly, we
            contribute 1% of our revenue to carbon removal.&nbsp;
            <a href="https://climate.stripe.com/Ve5kOs" target={"_blank"} rel="noreferrer">
              See how
            </a>
          </span>
        </div>
        <div onClick={trackViewGithubClicked}>
          <GitHubButton
            href="https://github.com/requestly/requestly"
            data-color-scheme="no-preference: dark; light: light; dark: dark;"
            data-size="large"
            data-show-count="false"
            aria-label="Star requestly/requestly on GitHub"
          >
            Requestly on Github
          </GitHubButton>
        </div>
      </div>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        handleToggleModal={() => setIsContactUsModalOpen(!isContactUsModalOpen)}
      />
    </>
  );
};

export default FreeAndEnterprisePlanTable;
