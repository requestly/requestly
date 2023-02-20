import { isExtensionVersionCompatible } from "actions/ExtensionActions";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import APP_CONSTANTS from "config/constants";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import ExtensionVersionError from "../errors/ExtensionVersionError";
import SessionsIndexPage from "./SessionsIndexPage";

const SessionsIndexPageContainer = () => {
  const [isFeatureCompatible, setIsFeatureCompatible] = useState(true);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  useEffect(() => {
    setIsFeatureCompatible(
      isExtensionVersionCompatible(
        APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION
      )
    );
  }, []);

  if (!isFeatureCompatible) {
    return <ExtensionVersionError />;
  }
  if (isWorkspaceMode)
    return <TeamFeatureComingSoon title="Session recording" />;
  return <SessionsIndexPage />;
};

export default SessionsIndexPageContainer;
