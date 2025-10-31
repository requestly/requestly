import React, { ReactNode, useCallback, useEffect, useRef } from "react";
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

export const SplitPaneLayout: React.FC<Props> = ({ bottomSheet, children, minSize = 25, initialSizes = [40, 60] }) => {
  const { sheetPlacement, setIsCollapsed, isBottomSheetOpen, isCollapsed } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;
  const splitPane = useRef<Split | null>(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  useEffect(() => {
    // Initialize Sheet Size on mount
    const savedSizes = localStorage.getItem("bottom_sheet_size");

    if (splitPane.current) {
      const sheetSize = savedSizes ? JSON.parse(savedSizes) : isSheetPlacedAtBottom ? initialSizes : [55, 45];
      splitPane.current.split.setSizes(sheetSize);
    }
  }, []);

  useEffect(() => {
    if (!splitPane.current) return;

    if (isCollapsed) {
      splitPane.current.split.setSizes([100, 0]);
    } else if (isBottomSheetOpen) {
      const savedSizes = localStorage.getItem("bottom_sheet_size");
      const restoreSize = savedSizes ? JSON.parse(savedSizes) : isSheetPlacedAtBottom ? initialSizes : [55, 45];
      splitPane.current.split.setSizes(restoreSize);
    }
  }, [isCollapsed, isBottomSheetOpen, isSheetPlacedAtBottom, initialSizes]);

  const handleDrag = useCallback(
    (sizes: number[]) => {
      // Detect if user manually dragged to collapsed state
      if (sizes[1] < 16) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    },
    [setIsCollapsed]
  );

  return (
    <Split
      key={splitDirection}
      ref={splitPane}
      direction={splitDirection}
      sizes={isSheetPlacedAtBottom ? initialSizes : [55, 45]}
      onDrag={handleDrag}
      onDragEnd={(sizes: number[]) => {
        localStorage.setItem("bottom_sheet_size", JSON.stringify(sizes));
      }}
      minSize={minSize || 25}
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
          height: splitDirection === SplitDirection.HORIZONTAL ? "100%" : "0px",
          width: splitDirection === SplitDirection.HORIZONTAL ? "0px" : "100%",
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
