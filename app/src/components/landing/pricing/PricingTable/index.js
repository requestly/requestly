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
          Developer time is expensive
        </Typography.Title>
        <Typography.Text className="text-center pricing-hero-text">
          With Requestly, developers save atleast 2 hrs of their time a week, i.e. savings of over $200 a month per
          developer
        </Typography.Text>
      </div>
      <FreeAndEnterprisePlanTable />
    </>
  );
};

export default PricingTable;
