import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Modal, Space } from "antd";
import { RQButton } from "lib/design-system/components";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import DownArrow from "assets/icons/down-arrow.svg?react";
import SessionDetails from "./SessionDetails";
import { SessionViewerTitle } from "./SessionViewerTitle";
import { RQSessionEvents } from "@requestly/web-sdk";
import { decompressEvents } from "./sessionEventsUtils";
import ShareButton from "../ShareButton";
import PageLoader from "components/misc/PageLoader";
import { getAuthInitialization, getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { getIsRequestedByOwner, getSessionRecordingEventsFilePath } from "store/features/session-recording/selectors";
import PermissionError from "../errors/PermissionError";
import NotFoundError from "../errors/NotFoundError";
import { getRecording } from "backend/sessionRecording/getRecording";
import { deleteRecording } from "../api";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import SaveRecordingConfigPopup from "./SaveRecordingConfigPopup";
import { trackSavedSessionViewed } from "modules/analytics/events/features/sessionRecording";
import { getAppFlavour, isAppOpenedInIframe } from "utils/AppUtils";
import "./sessionViewer.scss";
import BadSessionError from "../errors/BadSessionError";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface NavigationState {
  fromApp?: boolean;
  viewAfterSave?: boolean;
}
interface SessionCreatedOnboardingPromptProps {
  onClose: () => void;
}

const SessionCreatedOnboardingPrompt: React.FC<SessionCreatedOnboardingPromptProps> = ({ onClose }) => {
  const appFlavour = getAppFlavour();
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
        <Link
          to={
            appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR
              ? PATHS.SETTINGS.SESSIONS_SETTINGS.RELATIVE
              : PATHS.SESSIONS.SETTINGS.RELATIVE
          }
          className="session-onboarding-prompt-settings-link"
        >
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
  const isMobileScreen = useMediaQuery({ query: "(max-width: 550px)" });

  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const hasAuthInitialized = useSelector(getAuthInitialization);
  const eventsFilePath = useSelector(getSessionRecordingEventsFilePath);
  const isRequestedByOwner = useSelector(getIsRequestedByOwner);
  const userAttributes = useSelector(getUserAttributes);

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const [isFetching, setIsFetching] = useState(true);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [showNotFoundError, setShowNotFoundError] = useState(false);
  const [showBadSessionError, setShowBadSessionError] = useState(false);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [isDownloadPopupVisible, setIsDownloadPopupVisible] = useState(false);
  const isInsideIframe = useMemo(isAppOpenedInIframe, []);

  const navigateToList = useCallback(() => navigate(PATHS.SESSIONS.ABSOLUTE), [navigate]);
  const appFlavour = getAppFlavour();

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

  const hasUserCreatedSessions = useMemo(
    () =>
      userAttributes?.num_sessions > 0 ||
      userAttributes?.num_sessions_saved_online - 1 > 0 ||
      userAttributes?.num_sessions_saved_offline > 0,
    [
      userAttributes?.num_sessions,
      userAttributes?.num_sessions_saved_online,
      userAttributes?.num_sessions_saved_offline,
    ]
  );

  useEffect(() => {
    if ((location.state as NavigationState)?.viewAfterSave && !hasUserCreatedSessions) {
      setShowOnboardingPrompt(true);
    }
  }, [location.state, hasUserCreatedSessions]);

  useEffect(
    () => () => {
      dispatch(sessionRecordingActions.resetState());
    },
    [dispatch]
  );

  useEffect(() => {
    if (isInsideIframe) {
      trackSavedSessionViewed("embed");
      return;
    }

    if ((location.state as NavigationState)?.fromApp) {
      trackSavedSessionViewed("app");
    } else {
      trackSavedSessionViewed("link");
    }
  }, [id, location.state, isInsideIframe]);

  useEffect(() => {
    if (!hasAuthInitialized) return;

    setIsFetching(true);

    getRecording(id, user?.details?.profile?.uid, activeWorkspaceId, user?.details?.profile?.email)
      .then((res) => {
        setShowPermissionError(false);
        dispatch(sessionRecordingActions.setSessionRecordingMetadata({ id, ...res.payload }));
        try {
          const recordedSessionEvents: RQSessionEvents = decompressEvents(res.events);
          dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        } catch (e) {
          const err = new Error("Failed to decompress session events");
          err.name = "BadSessionEvents";
          throw err;
        } finally {
          setIsFetching(false);
        }
      })
      .catch((err) => {
        switch (err.name) {
          case "NotFound":
            setShowNotFoundError(true);
            break;
          case "BadSessionEvents":
            setShowBadSessionError(true);
            break;
          case "PermissionDenied":
          default:
            setShowPermissionError(true);
        }
      });
  }, [dispatch, hasAuthInitialized, id, user?.details?.profile?.uid, user?.details?.profile?.email, activeWorkspaceId]);

  const hideOnboardingPrompt = () => {
    setShowOnboardingPrompt(false);
  };

  if (showPermissionError) return <PermissionError isInsideIframe={isInsideIframe} />;
  if (showBadSessionError) return <BadSessionError />;
  if (showNotFoundError) return <NotFoundError />;

  return isFetching ? (
    <PageLoader message="Fetching session details..." />
  ) : (
    <>
      <div className={`session-viewer-page ${isInsideIframe ? "inside-iframe" : ""}`}>
        {showOnboardingPrompt && appFlavour !== GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR && (
          <SessionCreatedOnboardingPrompt onClose={hideOnboardingPrompt} />
        )}
        <div className="session-viewer-header">
          <div className="display-row-center w-full">
            {!isMobileScreen && (
              <RQButton
                iconOnly
                type="default"
                icon={<img alt="back" width="14px" height="12px" src="/assets/media/common/left-arrow.svg" />}
                onClick={() => redirectToSessionRecordingHome(navigate, isDesktopSessionsCompatible)}
                className="back-button"
              />
            )}

            <SessionViewerTitle isReadOnly={!isRequestedByOwner} isInsideIframe={isInsideIframe} />
          </div>
          {isRequestedByOwner && !isInsideIframe && !isMobileScreen ? (
            <div className="session-viewer-actions">
              <Space>
                <ShareButton recordingId={id} showShareModal={(location.state as NavigationState)?.viewAfterSave} />
                <Button
                  type="primary"
                  className="download-recording-btn"
                  onClick={() => setIsDownloadPopupVisible((prev) => !prev)}
                >
                  Download <DownArrow />
                </Button>
                <RQButton type="default" icon={<DeleteOutlined />} onClick={confirmDeleteAction} />
              </Space>
              {isDownloadPopupVisible && <SaveRecordingConfigPopup onClose={() => setIsDownloadPopupVisible(false)} />}
            </div>
          ) : null}
        </div>
        <SessionDetails key={id} isInsideIframe={isInsideIframe} isMobileView={isMobileScreen} />
      </div>
    </>
  );
};

export default SavedSessionViewer;
