export enum BottomSheetPlacement {
  RIGHT = "right",
  BOTTOM = "bottom",
}

export enum BottomSheetFeatureContext {
  api_client = "api_client",
  rules = "rules",
  mocks = "mocks",
}

export enum SplitDirection {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum SheetLayout {
  DRAWER = "drawer",
  SPLIT = "split",
}

export interface BottomSheetState {
  open: boolean;
  placement: BottomSheetPlacement;
  size: number[];
}

export type BottomSheetOrientation = Record<BottomSheetFeatureContext, BottomSheetState>;
