import React, { ReactNode } from "react";
import { Col, Row } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement } from "componentsV2/BottomSheet/types";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
  initialOffset?: number;
}

export const DrawerLayout: React.FC<Props> = ({ bottomSheet, children, initialOffset = null }) => {
  const { sheetPlacement, isBottomSheetOpen } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  return (
    <Row className="bottomsheet-layout-container drawer-layout">
      <Col className="content" span={sheetPlacement === BottomSheetPlacement.BOTTOM ? 24 : 14}>
        {children}
      </Col>
      <Col
        span={sheetPlacement === BottomSheetPlacement.BOTTOM ? 24 : 10}
        className={`${isSheetPlacedAtBottom ? " bottom-sheet-container" : "bottom-sheet-panel-container"}`}
        style={{
          bottom:
            sheetPlacement === BottomSheetPlacement.RIGHT ? 0 : isBottomSheetOpen ? 0 : `${initialOffset ?? -337}px`,
          height: isSheetPlacedAtBottom ? "440px" : `100%`,
        }}
      >
        {bottomSheet}
      </Col>
    </Row>
  );
};
