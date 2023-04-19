import React from "react";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import "./BillingFooter.css";

const BillingFooter = () => {
  return (
    <ul className="billing-footer">
      <li className="billing-footer-list-item">
        <div className="icon-wrapper-sm">
          <img alt="browse plan redirect" src="/assets/img/workspaces/arrow-redirect.svg" />
        </div>
        <a target="_blank" rel="noreferrer" href={APP_CONSTANTS.PATHS.PRICING.ABSOLUTE}>
          Browse plans
        </a>
      </li>

      <li className="billing-footer-list-item">
        Any questions? Reach our payment support team at{" "}
        <a className="text-underline" href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}>
          {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
        </a>
        .
      </li>
    </ul>
  );
};

export default BillingFooter;
