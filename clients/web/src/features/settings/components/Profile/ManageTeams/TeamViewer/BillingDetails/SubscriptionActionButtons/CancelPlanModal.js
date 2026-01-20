import React from "react";
import { Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

const CancelPlanModal = ({ isOpen, handleToggleModal }) => {
  return (
    <RQModal centered open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        To make changes to your subscription plan or any other queries, <br />
        please write to us at{" "}
        <a className="text-underline" href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}>
          {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
        </a>
        .
      </div>
      <Row align="middle" className="rq-modal-footer">
        <LearnMoreLink
          linkText="Learn more about team workspaces"
          href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
        />
      </Row>
    </RQModal>
  );
};

export default CancelPlanModal;
