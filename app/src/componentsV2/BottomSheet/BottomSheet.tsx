import React, { ReactNode } from "react";
import { Tabs, TabsProps } from "antd";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { BottomSheetPlacement } from "./types";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineKeyboardArrowLeft } from "@react-icons/all-files/md/MdOutlineKeyboardArrowLeft";
import { MdOutlineKeyboardArrowRight } from "@react-icons/all-files/md/MdOutlineKeyboardArrowRight";
import { MdOutlineKeyboardArrowUp } from "@react-icons/all-files/md/MdOutlineKeyboardArrowUp";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
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
  disableDocking = false,
  utilities,
  tabBarExtraContent = null,
  ...props
}) => {
  const { sheetPlacement, toggleBottomSheet, toggleSheetPlacement, isBottomSheetOpen } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;
  const isCollapsedSheetPlacedToRight = !isSheetPlacedAtBottom;

  const verticalTabExtraContent = (
    <div className="bottom-sheet-tab-extra-content">
      {tabBarExtraContent as ReactNode}

      <div className="bottom-sheet-utilites">
        {utilities}

        {disableDocking ? null : (
          <RQButton
            size="small"
            type="transparent"
            title="Toggle"
            onClick={() => toggleSheetPlacement()}
            className="bottom-sheet-toggle-btn"
            icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
          />
        )}

        <RQButton
          size="small"
          type="transparent"
          title="Collapse"
          className="bottom-sheet-collapse-btn bottom-sheet-collapse-btn__vertical"
          onClick={() => toggleBottomSheet({ action: "bottom_sheet_collapse_expand" })}
          icon={isBottomSheetOpen ? <MdOutlineKeyboardArrowDown /> : <MdOutlineKeyboardArrowUp />}
        />
      </div>
    </div>
  );

  const horizontalTabExtraContent = {
    left: (
      <div className="bottom-sheet-collapse-btn__horizontal-container">
        <RQButton
          size="small"
          type="transparent"
          title="Collapse"
          className="bottom-sheet-collapse-btn bottom-sheet-collapse-btn__horizontal"
          onClick={() => toggleBottomSheet({ action: "bottom_sheet_collapse_expand" })}
          icon={isBottomSheetOpen ? <MdOutlineKeyboardArrowRight /> : <MdOutlineKeyboardArrowLeft />}
        />
      </div>
    ),
    right: (
      <RQButton
        size="small"
        type="transparent"
        title="Toggle"
        onClick={() => toggleSheetPlacement()}
        className="bottom-sheet-toggle-btn"
        icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
      />
    ),
  };

  return (
    <Tabs
      tabPosition={isCollapsedSheetPlacedToRight ? "left" : "top"}
      items={items}
      moreIcon={null}
      data-tour-id={tourId}
      className={`${isCollapsedSheetPlacedToRight ? "collapsed-bottom-sheet__horizontal" : ""}`}
      defaultActiveKey={defaultActiveKey}
      onTabClick={() => toggleBottomSheet({ isOpen: true, action: "bottom_sheet_utility_toggle" })}
      tabBarExtraContent={
        sheetPlacement === BottomSheetPlacement.BOTTOM ? verticalTabExtraContent : horizontalTabExtraContent
      }
      {...props}
    />
  );
};
