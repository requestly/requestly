import React from "react";
import { Tooltip } from "antd";
import { useBottomSheetContext } from "componentsV2/BottomSheet/context";
import { BottomSheetPlacement } from "componentsV2/BottomSheet/types";

interface BottomSheetTabLabelProps {
  label: string;
  children: React.ReactNode;
}
export const BottomSheetTabLabel: React.FC<BottomSheetTabLabelProps> = ({ label, children }) => {
  const { sheetPlacement, isBottomSheetOpen } = useBottomSheetContext();
  const isSheetCollapsedToRight = !isBottomSheetOpen && sheetPlacement === BottomSheetPlacement.RIGHT;

  return (
    <Tooltip title={isSheetCollapsedToRight ? label : undefined} color="#000" placement="left">
      {children}
    </Tooltip>
  );
};
