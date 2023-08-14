import React from "react";
//SUB COMPONENTS
import FreeAndEnterprisePlanTable from "../ComparisonTable/v2-free-enterprise";

const PricingTable = () => {
  return (
    <>
      <div className="pricing-title-container">
        <div className="pricing-title ">Plans & pricing</div>
        <h1 className="pricing-hero-title text-bold text-center">Debug 5X faster with Requestly</h1>
      </div>
      <FreeAndEnterprisePlanTable />
    </>
  );
};

export default PricingTable;
