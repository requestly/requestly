import React from "react";
import { TabsProps, Button } from "antd";
import { useBottomSheetContext } from "./context";
import "./BottomSheet.scss";

interface BotttomSheetProps extends TabsProps {
  height: number;
}

export const BottomSheet: React.FC<BotttomSheetProps> = ({ height }) => {
  const { isOpen, viewAsPanel, toggleOpen, toggleViewAsPanel } = useBottomSheetContext();

  console.log({ isOpen, viewAsPanel, toggleOpen });

  return (
    <div
      className={`${viewAsPanel ? "bottom-sheet-panel-container" : "bottom-sheet-container "}`}
      style={{
        bottom: viewAsPanel ? 0 : isOpen ? `${height}px` : "60px",
      }}
    >
      <Button
        type="primary"
        onClick={() => {
          if (!viewAsPanel) {
            toggleOpen();
          }
        }}
      >
        OPEN KARNE KE LIYE CLICK KARO
      </Button>
      <Button type="primary" onClick={toggleViewAsPanel}>
        SEPARATE PANEL MEIN OPEN KARO
      </Button>
    </div>
  );
};
