import React, { ReactNode } from "react";
import { Col, Row } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement } from "componentsV2/BottomSheet/types";
import "./BottomSheetLayout.scss";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
}

export const BottomSheetLayout: React.FC<Props> = ({ bottomSheet, children }) => {
  const { sheetPlacement } = useBottomSheetContext();

  return (
    <Row className="bottomsheet-layout-container">
      <Col span={sheetPlacement === BottomSheetPlacement.BOTTOM ? 24 : 13}>{children}</Col>
      <Col span={sheetPlacement === BottomSheetPlacement.BOTTOM ? 24 : 11}>{bottomSheet}</Col>
    </Row>
  );
};
