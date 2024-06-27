import PageLoader from "components/misc/PageLoader";
import { useFetchSessions } from "./hooks/useFetchSessions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { SessionsOnboardingView } from "./components/OnboardingView/SessionsOnboardingView";

export const SessionsList = () => {
  const user = useSelector(getUserAuthDetails);
  const { sessions, isSessionsListLoading } = useFetchSessions();

  if (isSessionsListLoading) {
    return <PageLoader message="Loading sessions..." />;
  }

  if (user.loggedIn && sessions.length) {
    return <>LIST HERE</>;
  } else return <SessionsOnboardingView />;
};
