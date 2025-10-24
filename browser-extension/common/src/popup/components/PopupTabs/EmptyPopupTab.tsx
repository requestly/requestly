import { Col, Row, Typography } from "antd";
import React, { ReactNode } from "react";

interface EmptyTabProps {
  title: ReactNode;
  description: ReactNode;
  actionButton: ReactNode;
}

export const EmptyPopupTab: React.FC<EmptyTabProps> = ({ title, description, actionButton }) => {
  return (
    <Row align="middle" justify="center" className="empty-tab-view-container">
      <Col span={24} className="empty-tab-content">
        <Typography.Text className="empty-tab-view-title">{title}</Typography.Text>
        <Typography.Text className="empty-tab-view-description">{description}</Typography.Text>
        {actionButton}
      </Col>
    </Row>
  );
};
