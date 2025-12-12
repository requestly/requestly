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
  layout: SheetLayout.DRAWER;
  initialOffset?: number;
};

type Props = SplitLayoutProps | DrawerLayoutProps;

export const BottomSheetLayout: React.FC<Props> = (props) => {
  if (props.hideBottomSheet) {
    return props.children;
  }

  if (props.layout === SheetLayout.DRAWER) {
    return (
      <DrawerLayout bottomSheet={props.bottomSheet} initialOffset={props.initialOffset ?? 0}>
        {props.children}
      </DrawerLayout>
    );
  }

  if (props.layout === SheetLayout.SPLIT) {
    return (
      <SplitPaneLayout
        bottomSheet={props.bottomSheet}
        minSize={props.minSize}
        initialSizes={props.initialSizes ?? [40, 60]}
      >
        {props.children}
      </SplitPaneLayout>
    );
  }

  return null;
};
