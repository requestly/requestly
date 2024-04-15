import React from "react";
import { Tabs, Col, TabsProps } from "antd";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { MdExpandLess } from "@react-icons/all-files/md/MdExpandLess";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import "./BottomSheet.scss";

export const BottomSheet: React.FC<TabsProps> = ({ items, defaultActiveKey }) => {
  const { isBottomSheetOpen, isSheetPlacedAtBottom, toggleBottomSheet, toggleSheetPlacement } = useBottomSheetContext();

  return (
    <Col
      span={isSheetPlacedAtBottom ? 24 : 11}
      className={`${isSheetPlacedAtBottom ? " bottom-sheet-container" : "bottom-sheet-panel-container"}`}
      style={{
        bottom: !isSheetPlacedAtBottom ? 0 : isBottomSheetOpen ? 0 : `-335px`,
        height: isSheetPlacedAtBottom ? "440px" : `100%`,
      }}
    >
      <div className="bottom-sheet-action-buttons">
        {isSheetPlacedAtBottom && (
          <RQButton
            iconOnly
            type="default"
            icon={isBottomSheetOpen ? <MdExpandMore /> : <MdExpandLess />}
            onClick={() => {
              if (isSheetPlacedAtBottom) {
                toggleBottomSheet();
              }
            }}
          />
        )}

        <RQButton
          iconOnly
          type="default"
          onClick={toggleSheetPlacement}
          icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
        />
      </div>

      <Tabs defaultActiveKey={defaultActiveKey} items={items} type="card" />
    </Col>
  );
};
