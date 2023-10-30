import { Col, Row } from "antd";
import "./contentHeader.scss";

import React, { ReactNode } from "react";

export interface Props {
  title: string;
  subtitle: string;
  actions: ReactNode[];
}

// Contains common design and colors for app
const ContentHeader: React.FC<Props> = ({ title, subtitle, actions }: Props) => {
  return (
    <Row justify={"space-between"} align={"bottom"}>
      <Col span={12}>
        <div>{title}</div>
        <div>{subtitle}</div>
      </Col>
      <Col span={12}>
        <Row align={"bottom"}>
          {actions.map((action) => {
            return <Col>{action}</Col>;
          })}
        </Row>
      </Col>
    </Row>
  );
};

export default ContentHeader;
