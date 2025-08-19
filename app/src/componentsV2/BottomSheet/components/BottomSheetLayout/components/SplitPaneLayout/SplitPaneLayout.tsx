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
  const { sheetPlacement, isBottomSheetOpen, toggleBottomSheet } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;
  const splitPane = useRef(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  // Calculate sizes based on bottom sheet open state
  const getSplitSizes = () => {
    if (isSheetPlacedAtBottom) {
      // When collapsed, show only the header (~50px), when expanded show full content
      return isBottomSheetOpen ? initialSizes : [95, 5];
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

  // Handle manual resize via drag handle
  const handleSplit = (sizes: number[]) => {
    if (isSheetPlacedAtBottom) {
      const bottomSheetSize = sizes[1];
      // If user drags to expand beyond collapsed threshold, mark as open
      // If user drags to collapse below threshold, mark as closed
      const isExpanded = bottomSheetSize > 10; // 10% threshold
      
      if (isExpanded !== isBottomSheetOpen) {
        toggleBottomSheet({ isOpen: isExpanded, isTrack: true, action: "bottom_sheet_drag_resize" });
      }
    }
  };

  return (
    <Split
      key={splitDirection}
      ref={splitPane}
      direction={splitDirection}
      sizes={getSplitSizes()}
      minSize={isSheetPlacedAtBottom ? [minSize || 100, 40] : minSize || 100}
      onSplit={handleSplit}
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
            overflow: "auto",
          }}
        >
          {bottomSheet}
        </Col>
      </Row>
    </Split>
  );
};
