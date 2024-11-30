import React from "react";
import "./PricingBannerSale.scss";

const BlackFridaySaleBanner: React.FC = () => {
  return (
    <div className="sale-banner-container">
      <div>
        <p className="sale-text-banner">
          Pick an annual plan and apply <b>BlackFriday30</b> coupon code to get additional 30% off
        </p>
      </div>
    </div>
  );
};

export default BlackFridaySaleBanner;
