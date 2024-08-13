import React, { ReactNode } from "react";
import { DrawerLayout } from "./components/DrawerLayout/DrawerLayout";
import { SplitPaneLayout } from "./components/SplitPaneLayout/SplitPaneLayout";
import "./BottomSheetLayout.scss";

type BottomSheetLayoutProps = {
  bottomSheet: ReactNode;
  children: ReactNode;
  hideBottomSheet?: boolean;
};

type SplitLayoutProps = BottomSheetLayoutProps & {
  layout: "split";
  minSize?: number;
};

type DrawerLayoutProps = BottomSheetLayoutProps & {
  layout: "drawer";
  initialOffset?: number;
};

type Props = SplitLayoutProps | DrawerLayoutProps;

export const BottomSheetLayout: React.FC<Props> = (props) => {
  const { bottomSheet, children, hideBottomSheet = false, layout = "split" } = props;

  if (hideBottomSheet) {
    return children;
  }

  if (layout === "drawer") {
    return (
      <DrawerLayout
        bottomSheet={bottomSheet}
        children={children}
        initialOffset={(props as DrawerLayoutProps).initialOffset ?? 0}
      />
    );
  }

  if (layout === "split") {
    return (
      <SplitPaneLayout
        bottomSheet={bottomSheet}
        children={children}
        minSize={(props as SplitLayoutProps).minSize ?? 100}
      />
    );
  }

  return null;
};
