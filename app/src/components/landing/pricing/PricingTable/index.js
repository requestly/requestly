import React from "react";
//SUB COMPONENTS
import FreeAndEnterprisePlanTable from "../ComparisonTable/v2-free-enterprise";
import { Typography } from "antd";

const PricingTable = () => {
  return (
    <>
      <div className="pricing-title-container">
        <div className="pricing-title ">Plans & pricing</div>
        <Typography.Title level={1} className="text-center pricing-hero-title">
          50,000+ Companies Are Using Requestly Today
        </Typography.Title>
        <Typography.Text className="text-center pricing-hero-text">
          More than half of Fortune 500 companies already use Requestly
        </Typography.Text>
      </div>
      <FreeAndEnterprisePlanTable />
    </>
  );
};

export default PricingTable;
