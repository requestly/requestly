import React, { ReactNode } from "react";
import { Button, Tabs, TabsProps, Tooltip } from "antd";
import { useBottomSheetContext } from "./context";
import { BiDockRight } from "@react-icons/all-files/bi/BiDockRight";
import { BiDockBottom } from "@react-icons/all-files/bi/BiDockBottom";
import { BottomSheetPlacement } from "./types";
import { RQButton } from "lib/design-system-v2/components";
import "./BottomSheet.scss";
import { MdOutlineKeyboardArrowLeft } from "@react-icons/all-files/md/MdOutlineKeyboardArrowLeft";
import { MdOutlineKeyboardArrowRight } from "@react-icons/all-files/md/MdOutlineKeyboardArrowRight";
import { MdOutlineKeyboardArrowUp } from "@react-icons/all-files/md/MdOutlineKeyboardArrowUp";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";

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
  const {
    sheetPlacement,
    toggleBottomSheet,
    toggleSheetPlacement,
    isCollapsed,
    setIsCollapsed,
  } = useBottomSheetContext();
  const isSheetPlacedAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const tabExtraContent = (
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
          onClick={() => toggleBottomSheet({ isTrack: true, action: "bottom_sheet_collapse_expand" })}
          icon={
            isSheetPlacedAtBottom && isCollapsed ? (
              <MdOutlineKeyboardArrowUp />
            ) : isSheetPlacedAtBottom ? (
              <MdOutlineKeyboardArrowDown />
            ) : (
              <MdOutlineKeyboardArrowRight />
            )
          }
        />
      </div>
    </div>
  );

  return isCollapsed && !isSheetPlacedAtBottom ? (
    <div className="bottom-sheet-collapsed-view">
      <Tooltip key="expand-btn" title="Expand" placement="left">
        <RQButton
          size="default"
          type="transparent"
          title="Expand"
          icon={<MdOutlineKeyboardArrowLeft />}
          onClick={() => {
            setIsCollapsed(false);
            toggleBottomSheet({ isOpen: true, isTrack: true, action: "bottom_sheet_utility_toggle" });
          }}
        />
      </Tooltip>
      {items?.map((item: any) => (
        <Tooltip key={item.key} title={item.label?.props?.children?.[1] || item.key} placement="left">
          <RQButton
            size="default"
            type="transparent"
            title={item.key}
            icon={item.icon ? <item.icon /> : null}
            onClick={() => {
              setIsCollapsed(false);
              toggleBottomSheet({ isOpen: true, isTrack: true, action: "bottom_sheet_utility_toggle" });
            }}
          />
        </Tooltip>
      ))}
      <RQButton
        size="small"
        type="transparent"
        title="Toggle"
        onClick={() => toggleSheetPlacement()}
        className="bottom-sheet-toggle-btn-collapsed"
        icon={isSheetPlacedAtBottom ? <BiDockRight /> : <BiDockBottom />}
      />
    </div>
  ) : (
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
