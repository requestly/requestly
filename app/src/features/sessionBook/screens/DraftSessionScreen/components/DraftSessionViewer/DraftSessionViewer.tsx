import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { unstable_usePrompt, useLocation, useNavigate } from "react-router-dom";
import { Col, Modal, Row } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionBearLogo from "src-SessionBear/assets/sessionBearLogoFull.svg";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
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
import "./draftSessionViewer.scss";

interface DraftSessionViewerProps {
  isDesktopMode: boolean;
}

export const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ isDesktopMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const appFlavour = getAppFlavour();
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);
  const [isDiscardClicked, setIsDiscardClicked] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);
  const metadata = useSelector(getSessionRecordingMetaData);
  const isOpenedInIframe = location.pathname.includes("iframe");

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

        navigate(PATHS.SESSIONS.ABSOLUTE);
      },
      onCancel() {
        setIsDiscardClicked(false);
      },
    });
  }, [navigate]);

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
                <img src={SessionBearLogo} alt="SessionBear Logo" width={150} />
              ) : (
                <img src={RQLogo} alt="Requestly Logo" width={120} />
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

            <SaveSessionButton onSaveClick={handleSaveSessionClicked} />
          </div>
        </div>
        <div className="draft-session-viewer-body-wrapper">
          <Row className="draft-session-viewer-body" gutter={8} justify="space-between">
            <Col span={16}>
              <SessionPlayer onPlayerTimeOffsetChange={setSessionPlayerOffset} />
            </Col>
            <Col span={8}>
              <DraftSessionDetailsPanel playerTimeOffset={sessionPlayerOffset} />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
