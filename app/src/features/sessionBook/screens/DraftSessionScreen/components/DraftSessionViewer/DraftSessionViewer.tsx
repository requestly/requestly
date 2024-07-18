import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import SessionBearLogo from "src-SessionBear/assets/sessionBearLogoFull.svg";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import PATHS from "config/constants/sub/paths";
import { RQButton } from "lib/design-system/components";
import { SaveSessionButton } from "features/sessionBook/components/SaveSessionButton/SaveSessionButton";
import { getAppFlavour } from "utils/AppUtils";
import "./draftSessionViewer.scss";

interface DraftSessionViewerProps {
  onDiscard: () => void;
}

export const DraftSessionViewer: React.FC<DraftSessionViewerProps> = ({ onDiscard }) => {
  const navigate = useNavigate();
  const appFlavour = getAppFlavour();

  const handleDiscardSession = () => {
    onDiscard();
    navigate(PATHS.SESSIONS.ABSOLUTE);
  };
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
    </div>
  );
};
