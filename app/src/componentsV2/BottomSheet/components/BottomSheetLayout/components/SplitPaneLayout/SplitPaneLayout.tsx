import React, { ReactNode, useEffect, useRef } from "react";
import Split from "react-split";
import { Col, Row } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement, SplitDirection } from "componentsV2/BottomSheet/types";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
  minSize?: number;
  initialSizes?: Array<number>;
}

export const SplitPaneLayout: React.FC<Props> = ({ bottomSheet, children, minSize = 100, initialSizes = [40, 60] }) => {
  const { sheetPlacement, isBottomSheetOpen } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;
  const splitPane = useRef(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  // Calculate sizes based on bottom sheet open state
  const getSplitSizes = () => {
    if (isSheetPlacedAtBottom) {
      // When collapsed, show only the header (~50px), when expanded show full content
      return isBottomSheetOpen ? initialSizes : [85, 15];
    }
    return [55, 45];
  };

  useEffect(() => {
    // this useEffect on mount set sizes of split pane
    if (splitPane.current) {
      splitPane.current.split.setSizes(getSplitSizes());
    }
  }, []);

  useEffect(() => {
    // Update split sizes when bottom sheet open state changes
    if (splitPane.current && isSheetPlacedAtBottom) {
      splitPane.current.split.setSizes(getSplitSizes());
    }
  }, [isBottomSheetOpen, isSheetPlacedAtBottom]);

  return (
    <Split
      key={splitDirection}
      ref={splitPane}
      direction={splitDirection}
      sizes={getSplitSizes()}
      minSize={minSize || 100}
      className={`bottomsheet-layout-container ${
        splitDirection === SplitDirection.HORIZONTAL ? "horizontal-split" : "vertical-split"
      }`}
      gutter={(index, direction) => {
        const gutterContainer = document.createElement("div");
        gutterContainer.style.position = "relative";
        gutterContainer.className = ` bottomsheet-layout-gutter gutter-container gutter-container-${direction}`;
        gutterContainer.innerHTML = `<div class="gutter gutter-${direction}" />`;
        return gutterContainer;
      }}
      gutterStyle={() => {
        return {
          height: splitDirection === SplitDirection.HORIZONTAL ? "100%" : "6px",
          width: splitDirection === SplitDirection.HORIZONTAL ? "6px" : "100%",
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
          className={`${isSheetPlacedAtBottom ? "bottom-sheet-container" : "bottom-sheet-panel-container"} ${
            isSheetPlacedAtBottom && !isBottomSheetOpen ? "collapsed" : ""
          }`}
          style={{
            height: "100%",
            overflow: isSheetPlacedAtBottom && !isBottomSheetOpen ? "hidden" : "auto",
          }}
        >
          {bottomSheet}
        </Col>
      </Row>
    </Split>
  );
};
