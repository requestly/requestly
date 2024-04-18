import { trackEvent } from "modules/analytics";
import { MOCKS, MOCK_SERVER } from "./constants";

// file server
export const trackCreateFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.CREATED, params);
};

export const trackUpdateFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.UPDATED, params);
};

export const trackDeleteFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.DELETED, params);
};

// mocks v2
export const trackCreateMockEvent = (id: string, type: string, file_type: string, source?: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
    source,
  };
  trackEvent(MOCKS.CREATED, params);
};

export const trackUpdateMockEvent = (id: string, type: string, file_type: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKS.UPDATED, params);
};

export const trackDeleteMockEvent = (id: string, type: string, file_type: string) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKS.DELETED, params);
};

export const trackNewMockButtonClicked = (type: string, source: string) => {
  const params = { type, source };
  trackEvent(MOCKS.NEW_MOCK_BUTTON_CLICKED, params);
};

export const trackMockEditorOpened = (type: string) => {
  const params = { type };
  trackEvent(MOCKS.MOCK_EDITOR_OPENED, params);
};

export const trackMockEditorClosed = (type: string, cause: string) => {
  const params = { type, cause };
  trackEvent(MOCKS.MOCK_EDITOR_CLOSED, params);
};

export const trackMockUploadWorkflowStarted = (type: string) => {
  const params = { type };
  trackEvent(MOCKS.MOCK_UPLOAD_WORKFLOW_STARTED, params);
};

export const trackMockUploaded = (type: string) => {
  const params = { type };
  trackEvent(MOCKS.MOCK_UPLOADED, params);
};

export const trackMockUploadFailed = (type: string, cause: string) => {
  const params = { type, cause };
  trackEvent(MOCKS.MOCK_UPLOAD_FAILED, params);
};

export const trackTestMockClicked = () => {
  trackEvent(MOCKS.TEST_MOCK_CLICKED);
};

export const trackAiResponseButtonClicked = () => {
  const params = {};
  trackEvent(MOCKS.AI_MOCK_RESPONSE_BUTTON_CLICKED, params);
};

export const trackAiResponseGenerateClicked = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKS.AI_MOCK_RESPONSE_GENERATE_CLICKED, params);
};

export const trackAiResponseUseClicked = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKS.AI_MOCK_RESPONSE_USE_CLICKED, params);
};

export const trackAiResponseGenerated = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKS.AI_MOCK_RESPONSE_GENERATED, params);
};

export const trackAiResponseGenerateFailed = (prompt: string) => {
  const params = { prompt };
  trackEvent(MOCKS.AI_MOCK_RESPONSE_GENERATE_FAILED, params);
};

export const trackMockPasswordGenerateClicked = (update: boolean) => {
  const params = { update };
  trackEvent(MOCKS.MOCK_PASSWORD_GENERATE_CLICKED, params);
};

export const trackMockPasswordSaved = () => {
  const params = {};
  trackEvent(MOCKS.MOCK_PASSWORD_SAVED, params);
};

export const trackMockPasswordSaveError = () => {
  const params = {};
  trackEvent(MOCKS.MOCK_PASSWORD_SAVE_ERROR, params);
};

export const trackMockPasswordDeleted = () => {
  const params = {};
  trackEvent(MOCKS.MOCK_PASSWORD_DELETED, params);
};
