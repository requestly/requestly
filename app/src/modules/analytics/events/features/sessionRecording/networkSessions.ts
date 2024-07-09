import { trackEvent } from "modules/analytics";
import { SESSION_RECORDING } from "../constants";

export enum ActionSource {
  Preview = "preview",
  List = "list",
  TrafficTable = "taffic_table",
}

export function trackHarImportButtonClicked() {
  trackEvent(SESSION_RECORDING.network.import.har.btn_clicked);
}
export function trackHarImportCanceled() {
  trackEvent(SESSION_RECORDING.network.import.har.canceled);
}
export function trackHarImportCompleted() {
  trackEvent(SESSION_RECORDING.network.import.har.completed);
}

export function trackWebSessionImportButtonClicked() {
  trackEvent(SESSION_RECORDING.network.import.web_sessions.btn_clicked);
}
export function trackWebSessionImportCanceled() {
  trackEvent(SESSION_RECORDING.network.import.web_sessions.canceled);
}
export function trackWebSessionImportCompleted() {
  trackEvent(SESSION_RECORDING.network.import.web_sessions.completed);
}

export function trackDeleteNetworkSessionClicked(source: ActionSource) {
  const params = { source };
  trackEvent(SESSION_RECORDING.network.delete.btn_clicked, params);
}
export function trackDeleteNetworkSessionCanceled() {
  trackEvent(SESSION_RECORDING.network.delete.canceled);
}
export function trackDeleteNetworkSessionConfirmed() {
  trackEvent(SESSION_RECORDING.network.delete.confirmed);
}

export function trackDownloadNetworkSessionClicked(source: ActionSource) {
  const params = { source };
  trackEvent(SESSION_RECORDING.network.download, params);
}

export function trackNetworkSessionSaveClicked() {
  trackEvent(SESSION_RECORDING.network.save.btn_clicked);
}
export function trackNetworkSessionSaved() {
  trackEvent(SESSION_RECORDING.network.save.saved);
}
export function trackNetworkSessionSaveCanceled() {
  trackEvent(SESSION_RECORDING.network.save.canceled);
}

export function trackNetworkSessionViewerBackClicked() {
  trackEvent(SESSION_RECORDING.network.back_from_preview);
}

export function trackHarFileOpened() {
  trackEvent(SESSION_RECORDING.network.har_file_opened);
}
