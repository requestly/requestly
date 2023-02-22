import React, { useState } from "react";
import { Row, Col } from "antd";
import { RQButton } from "lib/design-system/components";
// import BuyForTeamsModal from "../../BuyForTeamsModal";
import ContactUsModal from "components/landing/contactUsModal";
import APP_CONSTANTS from "config/constants";
import FeatureRepresentation from "../../FeatureRepresentation";
import GitHubButton from "react-github-btn";
import { isExtensionInstalled } from "actions/ExtensionActions";
import Plans from "./PricingPlan.json";
import underlineIcon from "../../../../../assets/img/icons/common/underline.svg";
import "./index.css";
import { trackViewGithubClicked } from "modules/analytics/events/misc/business";

const FreeAndEnterprisePlanTable = () => {
  // Component State
  //   const [isBuyForTeamsModalActive, setIsBuyForTeamsModalActive] = useState(
  //     false
  //   );

  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

  const useRQwith = [
    "Web browsers & desktop apps",
    "Android & iOS",
    "Selenium & Cypress",
  ];

  return (
    <>
      <div className="pricing-table-wrapper">
        <Row className="pricing-table-row" gutter={[16, 16]}>
          <Col
            className="pricing-table-col"
            xs={24}
            sm={11}
            md={11}
            lg={11}
            xl={11}
          >
            <div className="pricing-col-header">
              <p className="text-gray plan-for">For individuals</p>
              <div className="header text-left">
                <span>
                  {
                    APP_CONSTANTS.PRICING.PLAN_HEADERS[
                      APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC
                    ]
                  }
                </span>{" "}
                plan
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
              {Plans.basic.map((feature, index) => (
                <FeatureRepresentation
                  key={index}
                  title={feature.title}
                  enabled={feature.enabled}
                />
              ))}
            </div>
            <div>
              <div className="basic-use-with-text text-left">
                Use Requestly with
              </div>
              <div>
                {useRQwith.map((title, index) => (
                  <div className="rq-use-with" key={index}>
                    <img src="/assets/icons/leftArrow.svg" alt="right arrow" />
                    <div>{title}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col
            className="pricing-table-col"
            xs={24}
            sm={11}
            md={11}
            lg={11}
            xl={11}
          >
            <div className="pricing-col-header">
              <p className="text-gray plan-for">
                For collaboration in QA & developer teams
              </p>
              <div className="header text-left">
                <span>
                  {
                    APP_CONSTANTS.PRICING.PLAN_HEADERS[
                      APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE
                    ]
                  }
                </span>{" "}
                plan
              </div>
              <div className="text-gray text-left price-container">
                <span className="price">$25</span> per member, per month
              </div>
              <RQButton
                type="primary"
                onClick={() => setIsContactUsModalOpen(true)}
              >
                Contact us
              </RQButton>
            </div>
            <div className="pro-basic-feature-title text-left">
              <span>
                Everything <img src={underlineIcon} alt="highlight" />
              </span>{" "}
              in Basic plan, and
            </div>
            <div>
              {Plans.team.map((feature, index) => (
                <FeatureRepresentation
                  key={index}
                  title={feature.title}
                  enabled={feature.enabled}
                />
              ))}
            </div>
          </Col>
        </Row>
        <div className="note-container text-gray text-center">
          Note: Requestly is an open-source platform. Downloading the source
          code from GitHub allows you to use the basic plan without any
          limitations, but sharing and other collaboration features will be
          unavailable.
        </div>
        <div onClick={trackViewGithubClicked}>
          <GitHubButton
            href="https://github.com/requestly/requestly"
            data-color-scheme="no-preference: dark; light: light; dark: dark;"
            data-size="large"
            data-show-count="false"
            aria-label="Star requestly/requestly on GitHub"
          >
            View on Github
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
