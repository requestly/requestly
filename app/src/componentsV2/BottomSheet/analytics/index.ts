import { BOTTOM_SHEET } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackBottomSheetToggled = (isOpen: boolean, action: string) => {
  trackEvent(BOTTOM_SHEET.BOTTOM_SHEET_TOGGLED, { isOpen, action });
};

export const trackViewBottomSheetOnRightClicked = () => {
  trackEvent(BOTTOM_SHEET.VIEW_BOTTOM_SHEET_ON_RIGHT_CLICKED);
};

export const trackViewBottomSheetOnBottomClicked = () => {
  trackEvent(BOTTOM_SHEET.VIEW_BOTTOM_SHEET_ON_BOTTOM_CLICKED);
};
