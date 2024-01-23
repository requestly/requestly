import React, { useState } from "react";
import sessionImg from "../../../../../assets/icons/session.svg";
import rulesImg from "../../../../../assets/icons/http-rules.svg";
import ContactUsModal from "components/landing/contactUsModal";
import GitHubButton from "react-github-btn";
import { trackViewGithubClicked } from "modules/analytics/events/misc/business";
import { Col, Row, Switch } from "antd";
import EnterpriseBanner from "./EnterpriseBanner";
import { PricingTable } from "features/pricing";
import { PRICING } from "features/pricing";
import "./index.css";

const FreeAndEnterprisePlanTable = () => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  const [product, setProduct] = useState(PRICING.PRODUCTS.HTTP_RULES);
  const [duration, setDuration] = useState(PRICING.DURATION.ANNUALLY);

  return (
    <>
      <div className="pricing-table-wrapper">
        <div className="text-center margin-bottom-one">
          <span className={duration === PRICING.DURATION.MONTHLY ? "tet-white text-bold" : "text-gray"}>Monthly </span>
          <Switch
            style={{ margin: "0 8px" }}
            size="small"
            checked={duration === PRICING.DURATION.ANNUALLY}
            onChange={(checked) => {
              setDuration(checked ? PRICING.DURATION.ANNUALLY : PRICING.DURATION.MONTHLY);
            }}
          />
          <span className={duration === PRICING.DURATION.ANNUALLY ? "tet-white text-bold" : "text-gray"}>
            Annually (save 20%)
          </span>
        </div>
        <Row>
          <Col className="pricing-table-product-view" xs={24} lg={6}>
            <Col xs={8} sm={8} lg={24}>
              <h1>Products</h1>
            </Col>
            <Col
              className={`pricing-table-product-view-item ${product === PRICING.PRODUCTS.HTTP_RULES && "active"}`}
              onClick={() => {
                setProduct(PRICING.PRODUCTS.HTTP_RULES);
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
              xs={10}
              sm={12}
              lg={24}
              className={`pricing-table-product-view-item ${product === PRICING.PRODUCTS.SESSION_REPLAY && "active"}`}
              onClick={() => {
                setProduct(PRICING.PRODUCTS.SESSION_REPLAY);
              }}
            >
              <div className="pricing-table-product-view-icon">
                <img src={sessionImg} alt="SessionBook" />
              </div>
              <div className="pricing-table-product-view-para">
                <h3>SessionBook</h3>
                <p>Capture Screen, mouse movement, network, console and more of any browser session</p>
              </div>
            </Col>
          </Col>
          <Col style={{ flex: 1 }}>
            <PricingTable product={product} duration={duration} />
          </Col>
        </Row>
        <EnterpriseBanner openContactUsModal={() => setIsContactUsModalOpen(true)} />
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
