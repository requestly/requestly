import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Layout } from "antd";
import { redirectToRules } from "utils/RedirectionUtils";
//SUB COMPONENTS
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import PricingTable from "../PricingTable";
import PricingFAQs from "../FAQs";
import EnterpriseRequestBanner from "../EnterpriseRequestBanner";
import CustomerStory from "../CustomerStory/index";
import ChromeStoreStats from "../ChromeStoreStats/index";
import { customerStoryData } from "utils/PricingPageTestimonials";
import { CompanyMarquee } from "components/misc/Marquee";
import RQLogo from "../../../../assets/images/logo/newRQlogo.svg";
import "./index.css";

const PricingIndexPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Layout.Header className="pricing-navbar">
        <Row className="w-full" justify="space-between" align="middle">
          <Col>
            <img className="logo" src={RQLogo} alt="requestly logo" onClick={() => redirectToRules(navigate)} />
          </Col>
          <HeaderUser />
        </Row>
      </Layout.Header>
      <div className="pricing-page-container">
        <Row className="pricing-page-body">
          <EnterpriseRequestBanner />
          <PricingTable />
          <div>
            <ChromeStoreStats />
            <div className="text-gray text-center">Trusted by developer & QA teams from 5000+ organizations</div>
            <div className="company-marquee-wrapper">
              <CompanyMarquee />
            </div>

            <div className="testimonials-container">
              {customerStoryData.map((data) => (
                <CustomerStory {...data} key={data.companyName} />
              ))}
            </div>
          </div>
          <div>
            <PricingFAQs />
          </div>
        </Row>
      </div>
    </>
  );
};
export default PricingIndexPage;
