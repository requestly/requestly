import { trackEvent } from "modules/analytics";
import { MOCKSV2 } from "../constants";

export const trackCreateMockEvent = (
  id: string,
  type: string,
  file_type: string,
  source?: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
    source,
  };
  trackEvent(MOCKSV2.CREATED, params);
};

export const trackUpdateMockEvent = (
  id: string,
  type: string,
  file_type: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.UPDATED, params);
};

export const trackDeleteMockEvent = (
  id: string,
  type: string,
  file_type: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.DELETED, params);
};

export const trackNewMockButtonClicked = (source: string) => {
  const params = { source };
  trackEvent(MOCKSV2.NEW_MOCK_BUTTON_CLICKED, params);
};

export const trackMockEditorOpened = () => {
  trackEvent(MOCKSV2.MOCK_EDITOR_OPENED);
};

export const trackMockEditorClosed = (cause: string) => {
  const params = { cause };
  trackEvent(MOCKSV2.MOCK_EDITOR_CLOSED, params);
};

export const trackMockUploadWorkflowStarted = () => {
  trackEvent(MOCKSV2.MOCK_UPLOAD_WORKFLOW_STARTED);
};

export const trackMockUploaded = () => {
  trackEvent(MOCKSV2.MOCK_UPLOADED);
};

export const trackMockUploadFailed = (cause: string) => {
  trackEvent(MOCKSV2.MOCK_UPLOAD_FAILED, cause);
};
