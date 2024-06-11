import { useNavigate } from "react-router-dom";
import { Row, Col, Layout, Divider } from "antd";
import { redirectToRules } from "utils/RedirectionUtils";
//SUB COMPONENTS
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import PricingTable from "../PricingTable";
import PricingFAQs from "../FAQs";
import EnterpriseRequestBanner from "../EnterpriseRequestBanner";
import ChromeStoreStats from "../ChromeStoreStats/index";
import { CompanyMarquee } from "components/misc/Marquee";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import "./index.css";
import ContactUsSection from "./ContactUsSection";
import BuyAdditionalSeats from "./BuyAdditionalSeats";
import CustomerStorySection from "./CustomerStorySection";
import TrustedByOrgsSection from "./TrustedByOrgsSection";
import OtherWaysToMakePurchase from "./OtherWaysToMakePurchase";
import LicensingAndSavings from "./LicensingAndSavings";
import HowToClaimVolumeDiscounts from "./HowToClaimVolumeDiscounts";
import PricingPageFooter from "./PricingPageFooter";

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
          <TrustedByOrgsSection />
          <BuyAdditionalSeats />
          <OtherWaysToMakePurchase />
          <LicensingAndSavings />
          <HowToClaimVolumeDiscounts />
          <CustomerStorySection />
          <ContactUsSection />
          <PricingPageFooter />
        </Row>
      </div>
    </>
  );
};
export default PricingIndexPage;
