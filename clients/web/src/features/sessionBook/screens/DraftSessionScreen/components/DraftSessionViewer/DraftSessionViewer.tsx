import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unstable_usePrompt, useLocation, useNavigate } from "react-router-dom";
import { Col, Modal, Row } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import PATHS from "config/constants/sub/paths";
import { RQButton } from "lib/design-system/components";
import { SaveSessionButton } from "features/sessionBook/components/SaveSessionButton/SaveSessionButton";
import { getAppFlavour } from "utils/AppUtils";
import { SessionPlayer } from "features/sessionBook/components/SessionPlayer/SessionPlayer";
import DraftSessionDetailsPanel from "../DraftSessionDetailsPanel/DraftSessionDetailsPanel";
import { trackDraftSessionDiscarded, trackDraftSessionViewed } from "features/sessionBook/analytics";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
import { getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { RQTooltip } from "lib/design-system-v2/components";
import { useRBAC } from "features/rbac";
import { useIsBrowserStackIntegrationOn } from "hooks/useIsBrowserStackIntegrationOn";
import "./draftSessionViewer.scss";

interface DraftSessionViewerProps {
  isDesktopMode: boolean;
}

export const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ isDesktopMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const appFlavour = getAppFlavour();
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);
  const [isDiscardClicked, setIsDiscardClicked] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);
  const metadata = useSelector(getSessionRecordingMetaData);
  const isOpenedInIframe = location.pathname.includes("iframe");
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "create");
  const isBrowserStackIntegrationOn = useIsBrowserStackIntegrationOn();

  if (!isDesktopMode) {
    unstable_usePrompt({
      when: !isDiscardClicked && !isSaveSessionClicked,
      message: "Exiting without saving will discard the draft.\nAre you sure you want to exit?",
    });
  }

  const handleSaveSessionClicked = useCallback(() => {
    setIsSaveSessionClicked(true);
  }, []);

  const handleDiscardSession = useCallback(() => {
    setIsDiscardClicked(true);

    Modal.confirm({
      title: "Confirm Discard",
      icon: <AiOutlineExclamationCircle />,
      content: "Are you sure you want to discard this draft recording?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        trackDraftSessionDiscarded();
        dispatch(sessionRecordingActions.setTrimmedSessiondata(null));
        navigate(PATHS.SESSIONS.ABSOLUTE);
      },
      onCancel() {
        setIsDiscardClicked(false);
      },
    });
  }, [navigate, dispatch]);

  useEffect(() => {
    trackDraftSessionViewed(metadata?.recordingMode);
  }, [metadata?.recordingMode]);

  return (
    <div className="draft-session-viewer-wrapper">
      <div className="draft-session-viewer-container">
        <div className="draft-session-viewer-header-container">
          {isOpenedInIframe ? (
            <>
              {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? (
                <img src={"/assets/media/common/sessionBearLogoFull.svg"} alt="SessionBear Logo" width={150} />
              ) : (
                <img
                  src={`/assets/media/common/${
                    isBrowserStackIntegrationOn ? "RQ-BStack Logo.svg" : "rq_logo_full.svg"
                  }`}
                  alt="Requestly Logo"
                  width={120}
                />
              )}
            </>
          ) : (
            <>
              <div className="draft-session-header-breadcrumb">
                <span
                  className="draft-session-header-breadcrumb__parent"
                  onClick={() => redirectToSessionRecordingHome(navigate)}
                >
                  All sessions
                </span>
                <span>&gt;</span>
                <span className="draft-session-header-breadcrumb__current">Draft session</span>
              </div>
            </>
          )}
          <div className="draft-session-viewer-actions">
            {!isOpenedInIframe && (
              <RQButton type="default" onClick={handleDiscardSession}>
                Discard
              </RQButton>
            )}

            <RQTooltip
              placement="bottomLeft"
              title={isValidPermission ? null : "As a viewer, you cannot save the session!"}
            >
              <SaveSessionButton disabled={!isValidPermission} onSaveClick={handleSaveSessionClicked} />
            </RQTooltip>
          </div>
        </div>
        <div className="draft-session-viewer-body-wrapper">
          <Row className="draft-session-viewer-body" gutter={8} justify="space-between">
            <Col span={15}>
              <SessionPlayer onPlayerTimeOffsetChange={setSessionPlayerOffset} />
            </Col>
            <Col span={9}>
              <DraftSessionDetailsPanel isReadOnly={!isValidPermission} playerTimeOffset={sessionPlayerOffset} />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
