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
  const { isOpen, viewAsPanel, toggleOpen, toggleViewAsPanel } = useBottomSheetContext();

  return (
    <Col
      span={viewAsPanel ? 9 : 24}
      className={`${viewAsPanel ? "bottom-sheet-panel-container" : "bottom-sheet-container "}`}
      style={{
        bottom: viewAsPanel ? 0 : isOpen ? 0 : `-335px`,
        height: viewAsPanel ? "100%" : `440px`,
      }}
    >
      <div className="bottom-sheet-action-buttons">
        {!viewAsPanel && (
          <RQButton
            iconOnly
            type="default"
            icon={isOpen ? <MdExpandMore /> : <MdExpandLess />}
            onClick={() => {
              if (!viewAsPanel) {
                toggleOpen();
              }
            }}
          />
        )}

        <RQButton
          iconOnly
          type="default"
          onClick={toggleViewAsPanel}
          icon={viewAsPanel ? <BiDockBottom /> : <BiDockRight />}
        />
      </div>

      <Tabs defaultActiveKey={defaultActiveKey} items={items} type="card" />
    </Col>
  );
};
