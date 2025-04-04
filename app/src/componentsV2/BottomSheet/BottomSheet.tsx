import React, { ReactNode } from "react";
import { Tabs, TabsProps } from "antd";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { MdExpandLess } from "@react-icons/all-files/md/MdExpandLess";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { BottomSheetPlacement } from "./types";
import "./BottomSheet.scss";

interface BottomSheetProps extends TabsProps {
  tourId?: string;
  disableDocking?: boolean;
  utilities?: ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  items,
  defaultActiveKey,
  tourId = "",
  disableDocking,
  utilities,
  ...props
}) => {
  const { isBottomSheetOpen, sheetPlacement, toggleBottomSheet, toggleSheetPlacement } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  return (
    <>
      <div className="bottom-sheet-utilites">
        {utilities}
        {isSheetPlacedAtBottom && (
          <RQButton
            size="small"
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
            size="small"
            iconOnly
            type="default"
            onClick={() => toggleSheetPlacement()}
            icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
          />
        )}
      </div>

      <Tabs
        moreIcon={null}
        data-tour-id={tourId}
        defaultActiveKey={defaultActiveKey}
        items={items}
        onTabClick={() => toggleBottomSheet(true)}
        {...props}
      />
    </>
  );
};
