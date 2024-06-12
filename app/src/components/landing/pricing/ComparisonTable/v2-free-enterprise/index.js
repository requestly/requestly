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
  const [duration, setDuration] = useState(PRICING.DURATION.ANNUALLY);
  const product = PRICING.PRODUCTS.HTTP_RULES;

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
        <Row className="w-full" justify="space-evenly">
          <Col>
            <PricingTable product={product} duration={duration} source={"pricing_page"} />
          </Col>
        </Row>
        <EnterpriseBanner openContactUsModal={() => setIsContactUsModalOpen(true)} />
      </div>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        handleToggleModal={() => setIsContactUsModalOpen(!isContactUsModalOpen)}
      />
    </>
  );
};

export default FreeAndEnterprisePlanTable;
