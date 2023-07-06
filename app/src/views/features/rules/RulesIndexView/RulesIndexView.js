import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
//SUB COMPONENTS
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
//VIEWS
import RulesIndexPage from "components/features/rules/RulesIndexPage";
//ACTIONS
import { isExtensionInstalled } from "actions/ExtensionActions";
// UTILS
import { getAppMode, getUserAuthDetails } from "store/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//discount Widget
import { StorageService } from "init";
import APP_CONSTANTS from "config/constants";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import SpinnerCard from "components/misc/SpinnerCard";
import Logger from "lib/logger";

const RulesIndexView = () => {
  //Global State
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  //Local State
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
  const [showInstallExtensionCTA, setShowInstallExtensionCTA] = useState(true);
  const [showLoader, setShowLoader] = useState(false);

  const checkForAndroidDebugger = async () => {
    if (user.loggedIn && user.details?.profile?.uid) {
      setShowLoader(true);

      if (await isUserUsingAndroidDebugger(user.details?.profile?.uid)) {
        setShowInstallExtensionCTA(false);
      } else {
        setShowInstallExtensionCTA(true);
      }
      setShowLoader(false);
    } else {
      setShowInstallExtensionCTA(true);
    }
  };

  const safeCheckForAndroidDebugger = useCallback(checkForAndroidDebugger, [user.details?.profile?.uid, user.loggedIn]);

  useEffect(() => {
    // setting if extension is disabled
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log("Reading storage in RulesIndexView useEffect");
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            setIsExtensionEnabled(value.isExtensionEnabled);
          } else {
            setIsExtensionEnabled(true);
          }
        });
    } else {
      safeCheckForAndroidDebugger();
    }
  }, [appMode, user, showInstallExtensionCTA, safeCheckForAndroidDebugger]);

  const renderRulesIndex = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      return <RulesIndexPage />;
    }

    /* User journey flowchart
    /* https://requestlyio.atlassian.net/wiki/spaces/RH/pages/1867777/RQLY-70+Removing+Extension+install+modal?focusedCommentId=5439489#comment-5439489
    */
    return isExtensionInstalled() ? (
      !isExtensionEnabled ? (
        <ExtensionDeactivationMessage />
      ) : (
        <RulesIndexPage />
      )
    ) : showInstallExtensionCTA ? (
      <InstallExtensionCTA
        heading="Install Browser extension to start modifying network requests"
        subHeading="Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser."
        eventPage="rules_page"
      />
    ) : (
      <RulesIndexPage />
    );
  };
  if (showLoader) {
    return <SpinnerCard customLoadingMessage="Getting your rules ready" skeletonType="list" />;
  } else {
    return <>{renderRulesIndex()}</>;
  }
};

export default RulesIndexView;
