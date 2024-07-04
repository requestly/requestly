import React from "react";
import { useSelector } from "react-redux";
//SUB COMPONENTS
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
//VIEWS
import RulesIndexPage from "components/features/rules/RulesIndexPage";
//ACTIONS
import { isExtensionInstalled } from "actions/ExtensionActions";
// UTILS
import { getAppMode, getIsExtensionEnabled } from "store/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";

const RulesIndexView = () => {
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);

  const renderRulesIndex = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      return <RulesIndexPage />;
    }
    console.log("!!!debug", "rulesIndex");

    /* User journey flowchart
    /* https://requestlyio.atlassian.net/wiki/spaces/RH/pages/1867777/RQLY-70+Removing+Extension+install+modal?focusedCommentId=5439489#comment-5439489
    */
    return isExtensionInstalled() ? (
      !isExtensionEnabled ? (
        <ExtensionDeactivationMessage />
      ) : (
        <RulesIndexPage />
      )
    ) : (
      <InstallExtensionCTA
        heading="Install Browser extension to start modifying network requests"
        subHeading="Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser."
        eventPage="rules_page"
      />
    );
  };
  return <>{renderRulesIndex()}</>;
};

export default RulesIndexView;
