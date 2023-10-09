import React from "react";
import { Row } from "antd";
import QuestionLine from "../../../../resources/icons/questionLine.svg";
import { LINKS } from "../../../constants";

const PopupFooter: React.FC = () => {
  return (
    <Row align="middle" justify="end" className="popup-footer">
      <div
        className="need-help"
        onClick={() => {
          // TODO: add analytics
          window.open(LINKS.REQUESTLY_EXTENSION_TROUBLESHOOTING, "_blank");
        }}
      >
        <QuestionLine /> Need help
      </div>
    </Row>
  );
};

export default PopupFooter;
