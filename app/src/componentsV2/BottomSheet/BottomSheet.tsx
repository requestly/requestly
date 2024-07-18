import React from "react";
import { Tabs, TabsProps } from "antd";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { MdExpandLess } from "@react-icons/all-files/md/MdExpandLess";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { BottomSheetPlacement } from "./types";
import "./BottomSheet.scss";

export const BottomSheet: React.FC<TabsProps & { tourId?: string; disableDocking?: boolean }> = ({
  items,
  defaultActiveKey,
  tourId = "",
  disableDocking,
}) => {
  const { isBottomSheetOpen, sheetPlacement, toggleBottomSheet, toggleSheetPlacement } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  return (
    <>
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
        {!disableDocking && (
          <RQButton
            iconOnly
            type="default"
            onClick={() => toggleSheetPlacement()}
            icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
          />
        )}
      </div>

      <Tabs
        data-tour-id={tourId}
        defaultActiveKey={defaultActiveKey}
        items={items}
        type="card"
        onTabClick={() => toggleBottomSheet(true)}
      />
    </>
  );
};
