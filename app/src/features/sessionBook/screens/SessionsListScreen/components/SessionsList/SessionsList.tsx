import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFetchSessions } from "./hooks/useFetchSessions";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { SessionsOnboardingView } from "../OnboardingView/SessionsOnboardingView";
import { SessionsListContentHeader } from "./components/SessionsListContentHeader/SessionsListContentHeader";
import { SessionsTable } from "./components/SessionsTable/SessionsTable";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import ShareRecordingModal from "views/features/sessions/ShareRecordingModal";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";
import { SessionBookDeprecationBanner } from "features/sessionBook/components/SessionBookDeprecationBanner";

export const SessionsList = () => {
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState("");
  const [forceRender, setForceRender] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sharingRecordId, setSharingRecordId] = useState("");
  const [selectedRowVisibility, setSelectedRowVisibility] = useState("");

  const _forceRender = useCallback(() => {
    setForceRender((prev) => !prev);
  }, []);

  const { sessions, isSessionsListLoading } = useFetchSessions(forceRender);

  const handleShareModalVisibiliity = useCallback((isVisible: boolean) => {
    setIsShareModalVisible(isVisible);
  }, []);

  const handleUpdateSharingRecordId = useCallback((recordId: string) => {
    setSharingRecordId(recordId);
  }, []);

  const handleUpdateSelectedRowVisibility = useCallback((visibility: string) => {
    setSelectedRowVisibility(visibility);
  }, []);

  const searchedSessions = useMemo(
    () => sessions.filter((session) => session.name.toLowerCase().includes(searchValue.toLowerCase())),
    [sessions, searchValue]
  );

  useEffect(() => {
    if (sessions?.length >= 0 && !isSharedWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS, sessions?.length);
    }
  }, [sessions?.length, isSharedWorkspaceMode]);

  if (isSessionsListLoading) {
    return <PageLoader message="Loading sessions..." />;
  }

  if (user.loggedIn && sessions.length) {
    return (
      <>
        <SessionBookDeprecationBanner style={{ marginBottom: 16 }} />
        <SessionsListContentHeader searchValue={searchValue} handleSearchValueUpdate={setSearchValue} />
        <SessionsTable
          sessions={searchedSessions}
          handleForceRender={_forceRender}
          handleUpdateSharingRecordId={handleUpdateSharingRecordId}
          handleShareModalVisibiliity={handleShareModalVisibiliity}
          handleUpdateSelectedRowVisibility={handleUpdateSelectedRowVisibility}
        />

        {isShareModalVisible ? (
          <ShareRecordingModal
            isVisible={isShareModalVisible}
            setVisible={handleShareModalVisibiliity}
            recordingId={sharingRecordId}
            currentVisibility={selectedRowVisibility}
            onVisibilityChange={_forceRender}
          />
        ) : null}
      </>
    );
  } else
    return (
      <>
        <SessionBookDeprecationBanner style={{ marginBottom: 16 }} />
        <RoleBasedComponent
          resource="session_recording"
          permission="create"
          fallback={
            <RBACEmptyState
              title="No sessions created yet."
              description="As a viewer, you will be able to view sessions once someone from your team creates them. You can contact your workspace admin to update your role."
            />
          }
        >
          <SessionsOnboardingView />
        </RoleBasedComponent>
      </>
    );
};
