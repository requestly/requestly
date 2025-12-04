import React, { ReactNode } from "react";
import { Tabs, TabsProps } from "antd";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { BottomSheetPlacement } from "./types";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
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
  const { sheetPlacement, toggleBottomSheet, toggleSheetPlacement } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const tabExtraContent = (
    <div className="bottom-sheet-tab-extra-content">
      {tabBarExtraContent as ReactNode}

      <div className="bottom-sheet-utilites">
        {utilities}

        {disableDocking ? null : (
          <RQTooltip title={isSheetPlacedAtBottom ? "Dock to right" : "Dock to bottom"}>
            <RQButton
              size="small"
              type="transparent"
              onClick={() => toggleSheetPlacement()}
              className="bottom-sheet-toggle-btn"
              icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
            />
          </RQTooltip>
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
