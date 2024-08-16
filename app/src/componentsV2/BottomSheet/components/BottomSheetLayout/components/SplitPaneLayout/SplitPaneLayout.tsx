import React, { ReactNode, useEffect, useRef } from "react";
import Split from "react-split";
import { Col, Row } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement, SplitDirection } from "componentsV2/BottomSheet/types";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
  minSize?: number;
}

export const SplitPaneLayout: React.FC<Props> = ({ bottomSheet, children, minSize = 100 }) => {
  const { sheetPlacement, isBottomSheetOpen } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;
  const splitPane = useRef(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  useEffect(() => {
    if (isSheetPlacedAtBottom && splitPane.current) {
      if (isBottomSheetOpen) {
        splitPane.current.split.setSizes([40, 60]);
      } else {
        splitPane.current.split.setSizes([100, 0]);
      }
    }
  }, [isBottomSheetOpen, isSheetPlacedAtBottom]);

  return (
    <Split
      ref={splitPane}
      direction={splitDirection}
      sizes={isSheetPlacedAtBottom ? [100, 0] : [58, 42]}
      minSize={isSheetPlacedAtBottom ? minSize : 350}
      className={`bottomsheet-layout-container ${
        splitDirection === SplitDirection.HORIZONTAL ? "horizontal-split" : "vertical-split"
      }`}
      gutterStyle={() => {
        return {
          height: splitDirection === SplitDirection.HORIZONTAL ? "100%" : "8px",
          width: splitDirection === SplitDirection.HORIZONTAL ? "8px" : "100%",
        };
      }}
      gutterAlign="center"
    >
      <Row style={splitDirection === SplitDirection.HORIZONTAL ? { height: "100%" } : { width: "100%" }}>
        <Col className="content" span={24}>
          {children}
        </Col>
      </Row>
      <Row style={splitDirection === SplitDirection.HORIZONTAL ? { height: "100%" } : { width: "100%" }}>
        <Col
          span={24}
          className={`${isSheetPlacedAtBottom ? "bottom-sheet-container" : "bottom-sheet-panel-container"}`}
          style={{
            height: isSheetPlacedAtBottom ? "auto" : "100%",
          }}
        >
          {bottomSheet}
        </Col>
      </Row>
    </Split>
  );
};
