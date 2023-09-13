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
import { Switch } from "antd";
import EnterpriseBanner from "./EnterpriseBanner";
import { redirectToCheckout } from "utils/RedirectionUtils";
import WorkspaceDropdown from "./WorkspaceDropdown";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";

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
      const isSelectedWorkspacePremium = workspaceToUpgrade?.subscriptionStatus === "active";

      if (planName === APP_CONSTANTS.PRICING.PLAN_NAMES.FREE) {
        return (
          <RQButton disabled={isUserPremium} onClick={() => (window.location.href = "/")} type="primary">
            Use now
          </RQButton>
        );
      } else if (
        (isSelectedWorkspacePremium || workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) &&
        planName === userPlanName
      ) {
        return (
          <RQButton disabled type="primary">
            Current Plan
          </RQButton>
        );
      } else if (product === APP_CONSTANTS.PRICING.PRODUCTS.SESSION_REPLAY) {
        return (
          <RQButton onClick={() => setIsContactUsModalOpen(true)} type="primary">
            Contact us
          </RQButton>
        );
      }

      return (
        <RQButton
          onClick={() =>
            redirectToCheckout({
              mode: workspaceToUpgrade.id === PRIVATE_WORKSPACE.id ? "individual" : "team",
              planName: planName,
              duration: duration,
              quantity: workspaceToUpgrade.accessCount,
              teamId: workspaceToUpgrade.id,
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
      user?.details?.planDetails?.planName,
      workspaceToUpgrade.accessCount,
      workspaceToUpgrade.id,
      workspaceToUpgrade?.subscriptionStatus,
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
        <div className="pricing-table-product-wrapper">
          <div className="pricing-table-product-view">
            <h1>Products</h1>
            <div
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
            </div>
            <div
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
            </div>
          </div>
          <div className="pricing-table-row">
            {Object.entries(PricingFeatures[product]).map(([planName, planDetails]) => (
              <div className="pricing-table-col" key={planName}>
                <div className="pricing-col-header">
                  <p className="text-gray plan-for">{planDetails.heading}</p>
                  <div className="header text-left">
                    <span style={{ textTransform: "capitalize" }}>{planDetails.planTitle}</span>
                  </div>
                  <div className="text-gray text-left price-container">
                    <span className="price">
                      ${PricingPlans[planName].plans[duration].usd.price * workspaceToUpgrade.accessCount}
                    </span>{" "}
                    per {duration === APP_CONSTANTS.PRICING.DURATION.MONTHLY ? "month" : "year"} for{" "}
                    {workspaceToUpgrade.accessCount} members
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
              </div>
            ))}
          </div>
        </div>
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
