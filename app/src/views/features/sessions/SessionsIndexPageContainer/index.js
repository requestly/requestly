import { isExtensionVersionCompatible } from "actions/ExtensionActions";
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
    setIsFeatureCompatible(isExtensionVersionCompatible(APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION));
  }, []);

  if (!isFeatureCompatible && !isWorkspaceMode) {
    return <ExtensionVersionError />;
  }

  return <SessionsIndexPage />;
};

export default SessionsIndexPageContainer;
