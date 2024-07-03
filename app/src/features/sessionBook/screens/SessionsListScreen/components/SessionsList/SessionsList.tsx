import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFetchSessions } from "./hooks/useFetchSessions";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/selectors";
import { SessionsOnboardingView } from "../OnboardingView/SessionsOnboardingView";
import { SessionsListContentHeader } from "./components/SessionsListContentHeader/SessionsListContentHeader";
import { SessionsTable } from "./components/SessionsTable/SessionsTable";

export const SessionsList = () => {
  const user = useSelector(getUserAuthDetails);
  const { sessions, isSessionsListLoading } = useFetchSessions();
  const [searchValue, setSearchValue] = useState("");

  const searchedSessions = useMemo(() => sessions.filter((session) => session.name.includes(searchValue)), [
    sessions,
    searchValue,
  ]);

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
