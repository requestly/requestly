import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContentListHeader } from "componentsV2/ContentList";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SettingOutlined } from "@ant-design/icons";
import { redirectToSessionSettings } from "utils/RedirectionUtils";
import { RQButton } from "lib/design-system/components";
import { NewSessionModal } from "features/sessionBook/screens/SessionsListScreen/modals/NewSessionModal/NewSessionModal";
import { trackNewSessionClicked } from "modules/analytics/events/features/sessionRecording";
import { ImportWebSessionModalButton } from "../ImportWebSessionModalButton/ImportWebSessionModalButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { ImportSessionModal } from "features/sessionBook/screens/SessionsListScreen/modals/ImportSessionModal/ImportSessionModal";
import "./sessionsListContentHeader.scss";

interface SessionsListContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (searchValue: string) => void;
}

export const SessionsListContentHeader: React.FC<SessionsListContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  const navigate = useNavigate();
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isImportSessionModalOpen, setIsImportSessionModalOpen] = useState(false);
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);
  const appFlavour = getAppFlavour();

  const openDownloadedSessionModalBtn = useMemo(() => {
    return isDesktopSessionsCompatible ? (
      <ImportWebSessionModalButton />
    ) : (
      <RQButton type="default" onClick={() => setIsImportSessionModalOpen(true)}>
        Upload & view downloaded sessions
      </RQButton>
    );
  }, [isDesktopSessionsCompatible]);

  return (
    <>
      <div className="sessions-table-header">
        <div className="sessions-table-title">
          {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? "Sessions" : "SessionBook"}
        </div>

        <ContentListHeader
          searchValue={searchValue}
          setSearchValue={handleSearchValueUpdate}
          actions={[
            <RQButton
              type="default"
              onClick={() => redirectToSessionSettings(navigate, window.location.pathname)}
              icon={<SettingOutlined />}
            >
              Settings
            </RQButton>,
            openDownloadedSessionModalBtn,
            <RQButton
              type="primary"
              onClick={() => {
                setIsNewSessionModalOpen(true);
                trackNewSessionClicked();
              }}
            >
              New Session
            </RQButton>,
          ]}
        />
      </div>
      <NewSessionModal isOpen={isNewSessionModalOpen} toggleModal={() => setIsNewSessionModalOpen(false)} />
      <ImportSessionModal isOpen={isImportSessionModalOpen} toggleModal={() => setIsImportSessionModalOpen(false)} />
    </>
  );
};
