import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Split from "react-split";
import { Col, Row } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement, SplitDirection } from "componentsV2/BottomSheet/types";

interface Props {
  bottomSheet: ReactNode;
  children: ReactNode;
  minSize?: number;
  initialSizes?: [number, number];
}

const getDefaultSizes: (isSheetPlacedAtBottom: boolean, initialSizes: [number, number]) => [number, number] = (
  isSheetPlacedAtBottom,
  initialSizes
) => {
  return isSheetPlacedAtBottom ? initialSizes : [55, 45];
};

export const SplitPaneLayout: React.FC<Props> = ({ bottomSheet, children, minSize = 26, initialSizes = [40, 60] }) => {
  const { sheetPlacement, isBottomSheetOpen, toggleBottomSheet, sheetSize, updateSheetSize } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const [sizes, setSizes] = useState<[number, number]>(() => {
    if (sheetSize) {
      return sheetSize;
    }
    return getDefaultSizes(isSheetPlacedAtBottom, initialSizes);
  });
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  const SNAP_OFFSET_PIXELS = isSheetPlacedAtBottom ? 100 : 200;

  useEffect(() => {
    if (!isBottomSheetOpen) {
      setSizes([100, 0]);
    } else {
      let targetSizes;
      if (sheetSize) {
        targetSizes = sheetSize;
      }

      if (!targetSizes) {
        targetSizes = getDefaultSizes(isSheetPlacedAtBottom, initialSizes);
      }

      setSizes(targetSizes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottomSheetOpen, isSheetPlacedAtBottom, sheetSize]);

  const handleDrag = useCallback(
    (newSizes: [number, number]) => {
      setSizes(newSizes);

      if (!splitContainerRef.current) return;

      const containerRect = splitContainerRef.current.getBoundingClientRect();
      const containerDimension = isSheetPlacedAtBottom ? containerRect?.height : containerRect?.width;
      const snapOffsetPercentage = (SNAP_OFFSET_PIXELS / containerDimension) * 100;

      if (newSizes[1] <= snapOffsetPercentage) {
        toggleBottomSheet({ isOpen: false, action: "bottom_sheet_collapse_expand" });
      } else {
        toggleBottomSheet({ isOpen: true, action: "bottom_sheet_collapse_expand" });
      }
    },
    [isSheetPlacedAtBottom, toggleBottomSheet, SNAP_OFFSET_PIXELS]
  );

  const handleDragEnd = useCallback(
    (newSizes: [number, number]) => {
      updateSheetSize(newSizes);
    },
    [updateSheetSize]
  );

  return (
    <div ref={splitContainerRef} className="bottomsheet-split-layout-container">
      <Split
        direction={splitDirection}
        sizes={sizes}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        snapOffset={[0, SNAP_OFFSET_PIXELS]}
        minSize={[isSheetPlacedAtBottom ? 150 : 500, minSize]}
        className={`bottomsheet-layout-container ${
          splitDirection === SplitDirection.HORIZONTAL ? "horizontal-split" : "vertical-split"
        }`}
        gutter={() => {
          const gutterContainer = document.createElement("div");
          gutterContainer.style.position = "relative";
          gutterContainer.className = ` bottomsheet-layout-gutter gutter-container`;
          gutterContainer.innerHTML = `<div class="gutter" />`;
          return gutterContainer;
        }}
        gutterStyle={() => {
          return {
            height: splitDirection === SplitDirection.HORIZONTAL ? "100%" : "0px",
            width: splitDirection === SplitDirection.HORIZONTAL ? "0px" : "100%",
            cursor: splitDirection === SplitDirection.HORIZONTAL ? "col-resize" : "row-resize",
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
    </div>
  );
};
