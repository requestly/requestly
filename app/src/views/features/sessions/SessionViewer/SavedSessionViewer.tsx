import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Space } from "antd";
import { RQButton } from "lib/design-system/components";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSessionEvents } from "@requestly/web-sdk";
import {
  compressEvents,
  decompressEvents,
  downloadSession,
  getSessionEventsToSave,
  getSessionRecordingOptions,
  prepareSessionToExport,
} from "./sessionEventsUtils";
import ShareButton from "../ShareButton";
import PageLoader from "components/misc/PageLoader";
import { getAuthInitialization, getUserAuthDetails, getUserAttributes } from "store/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import {
  getIsRequestedByOwner,
  getSessionRecording,
  getSessionRecordingEvents,
  getSessionRecordingEventsFilePath,
} from "store/features/session-recording/selectors";
import PermissionError from "../errors/PermissionError";
import NotFoundError from "../errors/NotFoundError";
import { getRecording } from "backend/sessionRecording/getRecording";
import { deleteRecording } from "../api";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import { toast } from "utils/Toast";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { defaultDebugInfo } from "./constants";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import { DebugInfo, SessionSaveMode } from "./types";
import {
  trackDraftSessionSaved,
  trackSavedSessionViewedFromApp,
  trackSavedSessionViewedFromLink,
} from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

interface NavigationState {
  fromApp?: boolean;
  viewAfterSave?: boolean;
}
interface SessionCreatedOnboardingPromptProps {
  onClose: () => void;
}

const SessionCreatedOnboardingPrompt: React.FC<SessionCreatedOnboardingPromptProps> = ({ onClose }) => {
  return (
    <div className="session-onboarding-prompt">
      <div className="display-flex">
        <CheckOutlined width={32} height={32} className="session-onboarding-prompt-check-icon" />
        <div className="session-onboarding-prompt-message">
          <p>
            <strong>Congratulations!</strong> you have just saved your first recording.
          </p>
          <p>
            You can now create a rule to <strong>automatically start recording</strong> when you visit a site.
          </p>
        </div>
      </div>
      <div className="session-onboarding-prompt-actions">
        <Link to={PATHS.SESSIONS.SETTINGS.RELATIVE} className="session-onboarding-prompt-settings-link">
          <SettingOutlined />
          <span>Open settings</span>
        </Link>
        <CloseOutlined className="session-onboarding-prompt-close-icon" onClick={onClose} />
      </div>
    </div>
  );
};

const SavedSessionViewer: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const hasAuthInitialized = useSelector(getAuthInitialization);
  const eventsFilePath = useSelector(getSessionRecordingEventsFilePath);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);
  const userAttributes = useSelector(getUserAttributes);
  const sessionRecording = useSelector(getSessionRecording);
  const sessionEvents = useSelector(getSessionRecordingEvents);

  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showNotFoundError, setShowNotFoundError] = useState(false);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [isDownloadPopupVisible, setIsDownloadPopupVisible] = useState(false);
  const [includedDebugInfo, setIncludedDebugInfo] = useState<CheckboxValueType[]>(defaultDebugInfo);

  const savedSessionRecordingOptions = useMemo(() => getSessionRecordingOptions(sessionRecording?.options), [
    sessionRecording?.options,
  ]);

  const isIncludeNetworkLogsDisabled = !savedSessionRecordingOptions.includes(DebugInfo.INCLUDE_NETWORK_LOGS);
  const isIncludeConsoleLogsDisabled = !savedSessionRecordingOptions.includes(DebugInfo.INCLUDE_CONSOLE_LOGS);

  const navigateToList = useCallback(() => navigate(PATHS.SESSIONS.ABSOLUTE), [navigate]);

  const confirmDeleteAction = useCallback(() => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure to delete this recording?
            <br />
            <br />
            Users having the shared link will not be able to access it anymore.
          </p>
        </div>
      ),
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteRecording(id, eventsFilePath);
        navigateToList();
      },
    });
  }, [id, eventsFilePath, navigateToList]);

  useEffect(() => {
    if ((location.state as NavigationState)?.viewAfterSave && !userAttributes?.num_sessions) {
      setShowOnboardingPrompt(true);
    }
  }, [location.state, userAttributes?.num_sessions]);

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if ((location.state as NavigationState)?.fromApp) {
      trackSavedSessionViewedFromApp();
    } else {
      trackSavedSessionViewedFromLink();
    }
  }, [id, location.state]);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsFetching(true);

    getRecording(id, user?.details?.profile?.uid, workspace?.id, user?.details?.profile?.email)
      .then((res) => {
        setShowPermissionError(false);
        dispatch(sessionRecordingActions.setSessionRecording({ id, ...res.payload }));

        const recordedSessionEvents: RQSessionEvents = decompressEvents(res.events);
        dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        setIsFetching(false);
      })
      .catch((err) => {
        switch (err.name) {
          case "NotFound":
            setShowNotFoundError(true);
            break;
          case "PermissionDenied":
          default:
            setShowPermissionError(true);
        }
      });
  }, [dispatch, hasAuthInitialized, id, user?.details?.profile?.uid, user?.details?.profile?.email, workspace?.id]);

  const hideOnboardingPrompt = () => {
    setShowOnboardingPrompt(false);
  };

  const handleDownloadFileClick = useCallback(
    (e: React.MouseEvent) => {
      setIsSaving(true);
      const events = compressEvents(getSessionEventsToSave(sessionEvents, sessionRecording.options));
      const recording = {
        name: sessionRecording.name,
        options: { ...sessionRecording.options },
        sessionAttributes: { ...sessionRecording.sessionAttributes },
      };

      prepareSessionToExport(events, recording)
        .then((fileContent) => downloadSession(fileContent, sessionRecording.name))
        .finally(() => {
          toast.success("Recording downloaded successfully.");
          setIsSaving(false);
          setIsDownloadPopupVisible(false);
          trackDraftSessionSaved(
            sessionRecording.sessionAttributes?.duration,
            sessionRecording.options,
            SessionSaveMode.LOCAL
          );
        });
    },
    [sessionEvents, sessionRecording]
  );

  if (showPermissionError) return <PermissionError />;
  if (showNotFoundError) return <NotFoundError />;

  return isFetching ? (
    <PageLoader message="Fetching session details..." />
  ) : (
    <>
      <div className="session-viewer-page">
        {showOnboardingPrompt && <SessionCreatedOnboardingPrompt onClose={hideOnboardingPrompt} />}
        <div className="session-viewer-header">
          <div className="display-row-center w-full">
            <RQButton
              iconOnly
              type="default"
              icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
              onClick={() => redirectToSessionRecordingHome(navigate)}
              className="back-button"
            />
            <SessionViewerTitle isReadOnly={!isRequestedByOwner} />
          </div>
          {isRequestedByOwner ? (
            <div className="session-viewer-actions">
              <Space>
                <ShareButton recordingId={id} showShareModal={(location.state as NavigationState)?.viewAfterSave} />
                <Button
                  type="primary"
                  className="download-recording-btn"
                  onClick={() => setIsDownloadPopupVisible((prev) => !prev)}
                >
                  Download Recording <DownOutlined />
                </Button>
                <RQButton type="default" icon={<DeleteOutlined />} onClick={confirmDeleteAction} />
              </Space>
              {isDownloadPopupVisible && (
                <SaveRecordingConfigPopup
                  isSaving={isSaving}
                  sessionSaveMode={SessionSaveMode.LOCAL}
                  includedDebugInfo={includedDebugInfo}
                  setIncludedDebugInfo={setIncludedDebugInfo}
                  isIncludeNetworkLogsDisabled={isIncludeNetworkLogsDisabled}
                  isIncludeConsoleLogsDisabled={isIncludeConsoleLogsDisabled}
                  onClose={() => setIsDownloadPopupVisible(false)}
                  handleDownloadFileClick={handleDownloadFileClick}
                />
              )}
            </div>
          ) : null}
        </div>
        <SessionDetails key={id} />
      </div>
    </>
  );
};

export default SavedSessionViewer;
