import React, { ReactNode } from "react";
import { DrawerLayout } from "./components/DrawerLayout/DrawerLayout";
import { SplitPaneLayout } from "./components/SplitPaneLayout/SplitPaneLayout";
import "./BottomSheetLayout.scss";
import { SheetLayout } from "componentsV2/BottomSheet/types";

type BottomSheetLayoutProps = {
  bottomSheet: ReactNode;
  children: ReactNode;
  hideBottomSheet?: boolean;
};

type SplitLayoutProps = BottomSheetLayoutProps & {
  layout: SheetLayout.SPLIT;
  minSize?: number;
  initialSizes?: Array<number>;
};

type DrawerLayoutProps = BottomSheetLayoutProps & {
  layout?: SheetLayout.DRAWER;
  initialOffset?: number;
};

type Props = SplitLayoutProps | DrawerLayoutProps;

export const BottomSheetLayout: React.FC<Props> = (props) => {
  const { bottomSheet, children, hideBottomSheet = false, layout = SheetLayout.SPLIT } = props;

  if (hideBottomSheet) {
    return children;
  }

  if (layout === SheetLayout.DRAWER) {
    return (
      <DrawerLayout
        bottomSheet={bottomSheet}
        children={children}
        initialOffset={(props as DrawerLayoutProps).initialOffset ?? 0}
      />
    );
  }

  if (layout === SheetLayout.SPLIT) {
    return (
      <SplitPaneLayout
        bottomSheet={bottomSheet}
        children={children}
        minSize={(props as SplitLayoutProps).minSize ?? 100}
        initialSizes={(props as SplitLayoutProps).initialSizes ?? [40, 60]}
      />
    );
  }

  return null;
};
