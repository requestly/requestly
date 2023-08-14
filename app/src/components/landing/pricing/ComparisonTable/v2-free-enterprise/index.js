import React, { useState } from "react";
import { RQButton } from "lib/design-system/components";
import sessionImg from "../../../../../assets/icons/session.svg";
import rulesImg from "../../../../../assets/icons/http-rules.svg";
// import BuyForTeamsModal from "../../BuyForTeamsModal";
import ContactUsModal from "components/landing/contactUsModal";
import APP_CONSTANTS from "config/constants";
import FeatureRepresentation from "../../FeatureRepresentation";
import GitHubButton from "react-github-btn";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { Plans } from "./pricingPlan";
import underlineIcon from "../../../../../assets/img/icons/common/underline.svg";
import "./index.css";
import { trackViewGithubClicked } from "modules/analytics/events/misc/business";
import StripeClimateBadge from "../../../../../assets/images/pages/pricing-page/Stripe-Climate-Badge.svg";

const FreeAndEnterprisePlanTable = () => {
  // Component State
  //   const [isBuyForTeamsModalActive, setIsBuyForTeamsModalActive] = useState(
  //     false
  //   );

  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const [product, setProduct] = useState(APP_CONSTANTS.PRICING.PRODUCTS.HTTP_RULES);
  const useRQwith = ["Web browsers & desktop apps", "Android & iOS", "Selenium & Cypress"];
  return (
    <>
      <div className="pricing-table-wrapper">
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
            <div className="pricing-table-col">
              <div className="pricing-col-header">
                <p className="text-gray plan-for">For individuals</p>
                <div className="header text-left">
                  <span>{APP_CONSTANTS.PRICING.PLAN_HEADERS[APP_CONSTANTS.PRICING.PLAN_NAMES.FREE]}</span> plan
                </div>
                <div className="price text-left price-container">$0</div>
                {isExtensionInstalled() ? (
                  <button disabled className="current-plan">
                    Current Plan
                  </button>
                ) : (
                  <RQButton type="primary">Use now</RQButton>
                )}
              </div>
              <div>
                {Plans[product][APP_CONSTANTS.PRICING.PLAN_NAMES.FREE].map((feature, index) => (
                  <FeatureRepresentation key={index} title={feature.title} enabled={feature.enabled} />
                ))}
              </div>
              <div>
                <div className="basic-use-with-text text-left">Use Requestly with</div>
                <div>
                  {useRQwith.map((title, index) => (
                    <div className="rq-use-with" key={index}>
                      <img src="/assets/icons/leftArrow.svg" alt="right arrow" />
                      <div>{title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pricing-table-col">
              <div className="pricing-col-header">
                <p className="text-gray plan-for">For collaboration in QA & developer teams</p>
                <div className="header text-left">
                  <span>{APP_CONSTANTS.PRICING.PLAN_HEADERS[APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL]}</span>
                </div>
                <div className="text-gray text-left price-container">
                  <span className="price">${APP_CONSTANTS.PRICING.PLAN_PRICES.PROFESSIONAL[product]}</span> per member,
                  per month
                </div>
                <RQButton type="primary" onClick={() => setIsContactUsModalOpen(true)}>
                  Contact us
                </RQButton>
              </div>
              <div className="pro-basic-feature-title text-left">
                <span>
                  Everything <img src={underlineIcon} alt="highlight" />
                </span>{" "}
                in Free plan, and
              </div>
              <div>
                {Plans[product][APP_CONSTANTS.PRICING.PLAN_NAMES.FREE].map((feature, index) => (
                  <FeatureRepresentation key={index} title={feature.title} enabled={feature.enabled} />
                ))}
              </div>
            </div>
          </div>
        </div>
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
