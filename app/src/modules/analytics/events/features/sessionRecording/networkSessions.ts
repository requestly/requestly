import { trackEvent } from "modules/analytics";
import { SESSION_RECORDING } from "../constants";

export enum ActionSource {
  Preview = "Preview",
  List = "List",
}

export function trackHarImportButtonClicked() {
  trackEvent(SESSION_RECORDING.network.import.btn_clicked);
}
export function trackHarImportCanceled() {
  trackEvent(SESSION_RECORDING.network.import.canceled);
}
export function trackHarImportCompleted() {
  trackEvent(SESSION_RECORDING.network.import.completed);
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
