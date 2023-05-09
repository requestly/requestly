import { trackEvent } from "modules/analytics";
import { MOCKSV2 } from "../constants";

export const trackCreateMockEvent = (id: string, type: string, file_type: string, source?: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
    source,
  };
  trackEvent(MOCKSV2.CREATED, params);
};

export const trackUpdateMockEvent = (id: string, type: string, file_type: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.UPDATED, params);
};

export const trackDeleteMockEvent = (id: string, type: string, file_type: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.DELETED, params);
};

export const trackNewMockButtonClicked = (type: string, source: string) => {
  const params = { type, source };
  trackEvent(MOCKSV2.NEW_MOCK_BUTTON_CLICKED, params);
};

export const trackMockEditorOpened = (type: string) => {
  const params = { type };
  trackEvent(MOCKSV2.MOCK_EDITOR_OPENED, params);
};

export const trackMockEditorClosed = (type: string, cause: string) => {
  const params = { type, cause };
  trackEvent(MOCKSV2.MOCK_EDITOR_CLOSED, params);
};

export const trackMockUploadWorkflowStarted = (type: string) => {
  const params = { type };
  trackEvent(MOCKSV2.MOCK_UPLOAD_WORKFLOW_STARTED, params);
};

export const trackMockUploaded = (type: string) => {
  const params = { type };
  trackEvent(MOCKSV2.MOCK_UPLOADED, params);
};

export const trackMockUploadFailed = (type: string, cause: string) => {
  const params = { type, cause };
  trackEvent(MOCKSV2.MOCK_UPLOAD_FAILED, params);
};

export const trackTestMockClicked = () => {
  trackEvent(MOCKSV2.TEST_MOCK_CLICKED);
};

export const trackAiResponseButtonClicked = () => {
  const params = {};
  trackEvent(MOCKSV2.AI_MOCK_RESPONSE_BUTTON_CLICKED, params);
};

export const trackAiResponseGenerateClicked = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKSV2.AI_MOCK_RESPONSE_GENERATE_CLICKED, params);
};

export const trackAiResponseUseClicked = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKSV2.AI_MOCK_RESPONSE_USE_CLICKED, params);
};

export const trackAiResponseGenerated = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKSV2.AI_MOCK_RESPONSE_GENERATED, params);
};

export const trackAiResponseGenerateFailed = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKSV2.AI_MOCK_RESPONSE_GENERATE_FAILED, params);
};
