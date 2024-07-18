import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionBearLogo from "src-SessionBear/assets/sessionBearLogoFull.svg";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import PATHS from "config/constants/sub/paths";
import { RQButton } from "lib/design-system/components";
import { SaveSessionButton } from "features/sessionBook/components/SaveSessionButton/SaveSessionButton";
import { getAppFlavour } from "utils/AppUtils";
import { SessionPlayer } from "features/sessionBook/components/SessionPlayer/SessionPlayer";
import DraftSessionDetailsPanel from "../DraftSessionDetailsPanel/DraftSessionDetailsPanel";
import "./draftSessionViewer.scss";

interface DraftSessionViewerProps {
  onDiscard: () => void;
}

export const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ onDiscard }) => {
  const navigate = useNavigate();
  const appFlavour = getAppFlavour();
  const [sessionPlayerOffset, setSessionPlayerOffset] = useState(0);

  const handleDiscardSession = useCallback(() => {
    onDiscard();
    navigate(PATHS.SESSIONS.ABSOLUTE);
  }, [onDiscard, navigate]);

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
          <SaveSessionButton />
        </div>
      </div>
      <Row className="draft-session-viewer-body" gutter={8} justify="space-between">
        <Col span={16}>
          <SessionPlayer onPlayerTimeOffsetChange={setSessionPlayerOffset} />
        </Col>
        <Col span={8} className="flex-1">
          <DraftSessionDetailsPanel playerTimeOffset={sessionPlayerOffset} />
        </Col>
      </Row>
    </div>
  );
};
