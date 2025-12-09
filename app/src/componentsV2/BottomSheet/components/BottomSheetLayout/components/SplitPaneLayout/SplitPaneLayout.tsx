import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const { sheetPlacement, isBottomSheetOpen, toggleBottomSheet } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const defaultSizes = useMemo(() => {
    return isSheetPlacedAtBottom ? initialSizes : [55, 45];
  }, [isSheetPlacedAtBottom, initialSizes]);

  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const splitDirection = isSheetPlacedAtBottom ? SplitDirection.VERTICAL : SplitDirection.HORIZONTAL;

  const SNAP_OFFSET_PIXELS = isSheetPlacedAtBottom ? 150 : 200;

  useEffect(() => {
    if (!isBottomSheetOpen) {
      setSizes([100, 0]);
    } else {
      setSizes(defaultSizes);
    }
  }, [isBottomSheetOpen, defaultSizes]);

  const handleDrag = useCallback(
    (newSizes: number[]) => {
      setSizes(newSizes);

      if (!splitContainerRef.current) return;

      const containerRect = splitContainerRef.current.getBoundingClientRect();
      const containerDimension = isSheetPlacedAtBottom ? containerRect?.height : containerRect?.width;
      const snapOffsetPercentage = (SNAP_OFFSET_PIXELS / containerDimension) * 100;

      console.log({ size: newSizes[1], snapOffsetPercentage });

      if (newSizes[1] <= snapOffsetPercentage) {
        console.log("collapse karo");
        toggleBottomSheet({ isOpen: false, action: "bottom_sheet_collapse_expand" });
      } else {
        toggleBottomSheet({ isOpen: true, action: "bottom_sheet_collapse_expand" });
      }
    },
    [isSheetPlacedAtBottom, toggleBottomSheet, SNAP_OFFSET_PIXELS]
  );

  return (
    <div ref={splitContainerRef} style={{ width: "100%", height: "100%" }}>
      <Split
        direction={splitDirection}
        sizes={sizes}
        onDrag={handleDrag}
        snapOffset={[0, SNAP_OFFSET_PIXELS]}
        minSize={minSize}
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
    </div>
  );
};
