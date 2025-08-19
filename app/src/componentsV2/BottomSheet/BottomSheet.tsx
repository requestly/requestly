import React, { ReactNode } from "react";
import { Tabs, TabsProps } from "antd";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";
import { FiChevronUp } from "@react-icons/all-files/fi/FiChevronUp";
import { BottomSheetPlacement } from "./types";
import { RQButton } from "lib/design-system-v2/components";
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

  const tabExtraContent = (
    <div className="bottom-sheet-tab-extra-content">
      {tabBarExtraContent as ReactNode}

      <div className="bottom-sheet-utilites">
        {utilities}

        {/* Chevron icon for expand/collapse when bottom sheet is at bottom */}
        {isSheetPlacedAtBottom && (
          <RQButton
            size="small"
            type="transparent"
            title={isBottomSheetOpen ? "Collapse" : "Expand"}
            onClick={() => toggleBottomSheet({ isTrack: true, action: "bottom_sheet_chevron_toggle" })}
            className="bottom-sheet-chevron-btn"
            icon={isBottomSheetOpen ? <FiChevronDown /> : <FiChevronUp />}
          />
        )}

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
      </div>
    </div>
  );

  return (
    <Tabs
      items={items}
      moreIcon={null}
      data-tour-id={tourId}
      defaultActiveKey={defaultActiveKey}
      onTabClick={() => toggleBottomSheet({ isOpen: true, isTrack: true, action: "bottom_sheet_utility_toggle" })}
      tabBarExtraContent={tabExtraContent}
      {...props}
    />
  );
};
