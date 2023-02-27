import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { FooterProps } from "../types";

export const SurveyModalFooter: React.FC<FooterProps> = ({
  page,
  handleNextPage,
}) => {
  return (
    <div className="rq-modal-footer w-full">
      <Row justify="space-between" align="middle" className="w-full">
        <Col className="text-gray">Page: {page}</Col>
        <Col>
          <RQButton
            type="primary"
            className="text-bold"
            onClick={handleNextPage}
          >
            Continue
          </RQButton>
        </Col>
      </Row>
    </div>
  );
};
