import { trackEvent } from "modules/analytics";

const EVENTS = {
  RECENTLY_ACCESSED_FILE_CLICKED: "recently_accessed_file_clicked",
  IMPORT_FILE_BTN_CLICKED: "import_file_btn_clicked",
  OPEN_SYSTEM_FILE_SELECTOR: "open_system_file_selector",
  FILE_SUCCESSFULLY_SELECTED: "file_successfully_selected",
  UNEXPECTED_FAILURE_AFTER_FILE_SELECTION: "unexpected_failure_after_file_selection",
  FILE_SELECTION_FAILED: "file_selection_failed",
};

export function trackRecentlyAccessedFileClicked(category: string) {
  trackEvent(EVENTS.RECENTLY_ACCESSED_FILE_CLICKED, { category });
}

export function trackImportFileBtnClicked(category: string) {
  trackEvent(EVENTS.IMPORT_FILE_BTN_CLICKED, { category });
}

export function trackOpenSystemFileSelector(category: string) {
  trackEvent(EVENTS.OPEN_SYSTEM_FILE_SELECTOR, { category });
}

export function trackFileSuccessfullySelected(category: string) {
  trackEvent(EVENTS.FILE_SUCCESSFULLY_SELECTED, { category });
}

export function trackUnexpectedFailureAfterFileSelection(category: string) {
  trackEvent(EVENTS.UNEXPECTED_FAILURE_AFTER_FILE_SELECTION, { category });
}

export function trackFileSelectionFailed(category: string) {
  trackEvent(EVENTS.FILE_SELECTION_FAILED, { category });
}
