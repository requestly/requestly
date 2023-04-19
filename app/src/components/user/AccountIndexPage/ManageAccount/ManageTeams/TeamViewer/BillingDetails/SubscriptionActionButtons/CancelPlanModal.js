import React from "react";
import { Row } from "antd";
import { RQModal } from "lib/design-system/components";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import LearnMoreAboutWorkspace from "../../common/LearnMoreAboutWorkspace";

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
        <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
      </Row>
    </RQModal>
  );
};

export default CancelPlanModal;
