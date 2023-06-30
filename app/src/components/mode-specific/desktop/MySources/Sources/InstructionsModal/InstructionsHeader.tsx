import { Avatar, Col, Row, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import React from "react";

interface InstructionsHeaderProps {
  icon: string;
  heading: string;
  description: string;
  setShowInstructions: (value: boolean) => void;
  ExtraContentOnRight?: React.ReactNode;
}

const InstructionsHeader: React.FC<InstructionsHeaderProps> = ({
  icon,
  heading,
  description,
  setShowInstructions,
  ExtraContentOnRight,
}) => {
  const navigateBackToSources = () => {
    setShowInstructions?.(false);
  };

  return (
    <>
      <Row className="text-gray setup-instructions-back-btn" onClick={navigateBackToSources}>
        <Col>
          <RQButton
            iconOnly
            type="default"
            data-dismiss="modal"
            icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
            className="header-icon-btn"
          />
        </Col>
        <Col>Back</Col>
      </Row>
      <Row className="mt-16 setup-instructions-header">
        <Col span={1} className="mr-2">
          <Avatar src={icon} />
        </Col>
        <Col span={18} className="mr-16">
          <Row>
            <Typography.Title level={4} className="mb-0">
              {heading}
            </Typography.Title>
          </Row>
          <Row className="mt-8 setup-instructions-description">
            <Typography.Text className="text-gray">{description}</Typography.Text>
          </Row>
        </Col>
        {ExtraContentOnRight ? <Col span={4}>{ExtraContentOnRight}</Col> : null}
      </Row>
    </>
  );
};

export default InstructionsHeader;
