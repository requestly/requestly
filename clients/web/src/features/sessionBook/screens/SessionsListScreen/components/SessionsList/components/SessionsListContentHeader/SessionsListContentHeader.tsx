import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ContentListHeader } from "componentsV2/ContentList";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { redirectToSessionSettings } from "utils/RedirectionUtils";
import { RQButton } from "lib/design-system/components";
import { NewSessionModal } from "features/sessionBook/modals/NewSessionModal/NewSessionModal";
import { trackNewSessionClicked } from "modules/analytics/events/features/sessionRecording";
import { ImportWebSessionModalButton } from "../ImportWebSessionModalButton/ImportWebSessionModalButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { ImportSessionModal } from "features/sessionBook/modals/ImportSessionModal/ImportSessionModal";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { useRBAC } from "features/rbac";
import "./sessionsListContentHeader.scss";

interface SessionsListContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (searchValue: string) => void;
}

export const SessionsListContentHeader: React.FC<SessionsListContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isImportSessionModalOpen, setIsImportSessionModalOpen] = useState(false);
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);
  const appFlavour = getAppFlavour();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "update");

  const openDownloadedSessionModalBtn = useMemo(() => {
    return isDesktopSessionsCompatible ? (
      <ImportWebSessionModalButton />
    ) : (
      <RQButton type="default" icon={<MdOutlineFileDownload />} onClick={() => setIsImportSessionModalOpen(true)}>
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
          actions={
            isValidPermission
              ? [
                  <RQButton
                    type="default"
                    onClick={() => redirectToSessionSettings(navigate, location.pathname)}
                    icon={<MdOutlineSettings />}
                  >
                    Settings
                  </RQButton>,
                  openDownloadedSessionModalBtn,
                  <RQButton
                    icon={<IoMdAdd />}
                    type="primary"
                    onClick={() => {
                      setIsNewSessionModalOpen(true);
                      trackNewSessionClicked();
                    }}
                  >
                    New Session
                  </RQButton>,
                ]
              : null
          }
        />
      </div>
      <NewSessionModal isOpen={isNewSessionModalOpen} toggleModal={() => setIsNewSessionModalOpen(false)} />
      <ImportSessionModal isOpen={isImportSessionModalOpen} toggleModal={() => setIsImportSessionModalOpen(false)} />
    </>
  );
};
