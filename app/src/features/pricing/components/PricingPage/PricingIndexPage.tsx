import { useState } from "react";
import { Col, Layout, Row, Switch } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { useNavigate } from "react-router-dom";
import { PricingTable } from "../PricingTable";
import { PRICING } from "features/pricing/constants/pricing";
import { SOURCE } from "modules/analytics/events/common/constants";
import { redirectToRules } from "utils/RedirectionUtils";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import { EnterprisePlanCard } from "./components/EnterprisePlanCard/EnterprisePlanCard";
import { CompaniesSection } from "./components/CompaniesSection/CompaniesSection";
import { StatsCard } from "./components/StatsCard/StatsCard";
// import HowToClaimVolumeDiscounts from "./components/HowToClaimVolumeDiscounts";
import OtherWaysToMakePurchase from "./components/OtherWaysToMakePurchase";
// import { CustomerReviews } from "./components/CustomerReviews/CustomerReviews";
import PricingFAQs from "./components/FAQs";
import PricingPageFooter from "./components/PricingPageFooter";
import EnterpriseRequestBanner from "./components/EnterpriseRequestBanner";
import "./pricingIndexPage.scss";

export const PricingIndexPage = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(PRICING.DURATION.ANNUALLY);

  return (
    <div className="pricing-page-wrapper">
      <div className="pricing-page-container">
        <Layout.Header className="pricing-navbar">
          <div className="pricing-navbar-content">
            <img className="logo" src={RQLogo} alt="requestly logo" onClick={() => redirectToRules(navigate)} />
            <HeaderUser />
          </div>
        </Layout.Header>
        <div className="pricing-page-body-wrapper">
          <EnterpriseRequestBanner />
          <div className="pricing-page-body">
            <div className="page-yellow-text">Plans & pricing</div>
            <div className="pricing-page-title">50,000+ Companies Are Using Requestly Today</div>
            <div className="pricing-page-description">
              More than half of Fortune 500 companies already use Requestly
            </div>
            <Row justify="center" className="display-row-center w-full mt-24" gutter={24}>
              <Col className="display-row-center plan-duration-switch-container">
                <Switch
                  size="small"
                  checked={duration === PRICING.DURATION.ANNUALLY}
                  onChange={(checked) => {
                    setDuration(checked ? PRICING.DURATION.ANNUALLY : PRICING.DURATION.MONTHLY);
                  }}
                />
                <span className="pricing-page-duartion-label">
                  {" "}
                  Annually<span className="success"> (save 20%)</span>
                </span>
              </Col>
            </Row>
            <div className="pricing-page-table-wrapper">
              <PricingTable duration={duration} source={SOURCE.PRICING_PAGE} />
            </div>
            <EnterprisePlanCard />
            <CompaniesSection />
            <StatsCard />
            <OtherWaysToMakePurchase />
            {/* <div className="pricing-page-other-actions-container">
              <HowToClaimVolumeDiscounts />
            </div> */}
            {/* <CustomerReviews /> */}
            <PricingFAQs />
          </div>
          <PricingPageFooter />
        </div>
      </div>
    </div>
  );
};
