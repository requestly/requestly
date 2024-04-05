import React from "react";
import { TabsProps, Tabs, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { MdExpandLess } from "@react-icons/all-files/md/MdExpandLess";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import "./BottomSheet.scss";

interface BotttomSheetProps extends TabsProps {
  height?: number;
}

export const BottomSheet: React.FC<BotttomSheetProps> = ({ height, items, defaultActiveKey }) => {
  const { isBottomSheetOpen, viewAsSidePanel, toggleBottomSheet, toggleViewAsSidePanel } = useBottomSheetContext();

  return (
    <Col
      span={viewAsSidePanel ? 11 : 24}
      className={`${viewAsSidePanel ? "bottom-sheet-panel-container" : "bottom-sheet-container "}`}
      style={{
        bottom: viewAsSidePanel ? 0 : isBottomSheetOpen ? 0 : `-335px`,
        height: viewAsSidePanel ? "100%" : `440px`,
      }}
    >
      <div className="bottom-sheet-action-buttons">
        {!viewAsSidePanel && (
          <RQButton
            iconOnly
            type="default"
            icon={isBottomSheetOpen ? <MdExpandMore /> : <MdExpandLess />}
            onClick={() => {
              if (!viewAsSidePanel) {
                toggleBottomSheet();
              }
            }}
          />
        )}

        <RQButton
          iconOnly
          type="default"
          onClick={toggleViewAsSidePanel}
          icon={viewAsSidePanel ? <BiDockBottom /> : <BiDockRight />}
        />
      </div>

      <Tabs defaultActiveKey={defaultActiveKey} items={items} type="card" />
    </Col>
  );
};
