import { trackEvent } from "modules/analytics";
import { COMMAND_PALETTE } from "./constants";

export const trackCommandPaletteOpened = (os: string) => {
  const params = { os };
  trackEvent(COMMAND_PALETTE.COMMAND_PALETTE_OPENED, params);
};

export const trackCommandPaletteClosed = () => {
  trackEvent(COMMAND_PALETTE.COMMAND_PALETTE_CLOSED);
};

export const trackCommandPaletteOptionSelected = (option: string) => {
  const params = { option };
  trackEvent(COMMAND_PALETTE.COMMAND_PALETTE_OPTION_SELECTED, params);
};

export const trackCommandPaletteOptionSearched = () => {
  trackEvent(COMMAND_PALETTE.COMMAND_PALETTE_OPTION_SEARCHED);
};
