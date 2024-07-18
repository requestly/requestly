import React, { useCallback, useState } from "react";
import { unstable_usePrompt, useNavigate } from "react-router-dom";
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
import { trackDraftSessionDiscarded } from "modules/analytics/events/features/sessionRecording";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import "./draftSessionViewer.scss";

interface DraftSessionViewerProps {
  isDesktopMode: boolean;
}

export const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ isDesktopMode }) => {
  const navigate = useNavigate();
  const appFlavour = getAppFlavour();
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);
  const [isDiscardClicked, setIsDiscardClicked] = useState(false);
  const [isSaveSessionClicked, setIsSaveSessionClicked] = useState(false);

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
      icon: <ExclamationCircleOutlined />,
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

  return (
    <div className="draft-session-viewer-container">
      <div className="draft-session-viewer-header-container">
        {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? (
          <img src={SessionBearLogo} alt="SessionBear Logo" width={130} />
        ) : (
          <img src={RQLogo} alt="Requestly Logo" width={120} />
        )}

        <div className="draft-session-viewer-actions">
          <RQButton type="default" onClick={handleDiscardSession}>
            Discard
          </RQButton>
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
  );
};
