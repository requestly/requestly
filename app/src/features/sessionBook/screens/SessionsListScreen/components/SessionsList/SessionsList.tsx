import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFetchSessions } from "./hooks/useFetchSessions";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/selectors";
import { SessionsOnboardingView } from "../OnboardingView/SessionsOnboardingView";
import { SessionsListContentHeader } from "./components/SessionsListContentHeader/SessionsListContentHeader";
import { SessionsTable } from "./components/SessionsTable/SessionsTable";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

export const SessionsList = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const user = useSelector(getUserAuthDetails);
  const { sessions, isSessionsListLoading } = useFetchSessions();
  const [searchValue, setSearchValue] = useState("");

  const searchedSessions = useMemo(() => sessions.filter((session) => session.name.includes(searchValue)), [
    sessions,
    searchValue,
  ]);

  useEffect(() => {
    if (searchedSessions?.length >= 0 && !isWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SESSIONS, searchedSessions?.length);
    }
  }, [searchedSessions?.length, isWorkspaceMode]);

  if (isSessionsListLoading) {
    return <PageLoader message="Loading sessions..." />;
  }

  if (user.loggedIn && sessions.length) {
    return (
      <>
        <SessionsListContentHeader searchValue={searchValue} handleSearchValueUpdate={setSearchValue} />
        <SessionsTable sessions={searchedSessions} />
      </>
    );
  } else return <SessionsOnboardingView />;
};
