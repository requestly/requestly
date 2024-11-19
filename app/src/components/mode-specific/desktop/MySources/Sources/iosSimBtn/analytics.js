import { trackEvent } from "modules/analytics";

export const TRACKING_CONSTANTS = {
  SCAN_SIMULATORS_CLICKED: "scan_simulators_clicked",
  SCAN_SIMULATOR_MODES: {
    TOP_BUTTON: "top_button",
    CONTEXT_MENU: "context_menu",
  },

  NO_SIMULATORS_FOUND: "no_simulators_found",
  FAILURE_TO_CONNECT_TO_SIMULATOR: "failure_to_connect_to_simulator",
};

export function trackScanSimulatorsClicked(MODE) {
  trackEvent(TRACKING_CONSTANTS.SCAN_SIMULATORS_CLICKED);
}

export function trackNoSimulatorsFound() {
  trackEvent(TRACKING_CONSTANTS.NO_SIMULATORS_FOUND);
}

export function trackFailedToConnectToSimulator() {
  trackEvent(TRACKING_CONSTANTS.FAILURE_TO_CONNECT_TO_SIMULATOR);
}
