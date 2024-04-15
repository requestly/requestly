import React, { ReactNode } from "react";
import { Col, Row } from "antd";
import "./BottomSheetLayout.scss";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
  sheetWidth: number;
  contentWidth: number;
  isSheetHidden?: boolean;
}

export const BottomSheetLayout: React.FC<Props> = ({
  bottomSheet,
  children,
  isSheetHidden = false,
  sheetWidth,
  contentWidth,
}) => {
  return (
    <Row className="bottomsheet-layout-container">
      <Col span={contentWidth}>{children}</Col>
      {!isSheetHidden && <Col span={sheetWidth}>{bottomSheet}</Col>}
    </Row>
  );
};
