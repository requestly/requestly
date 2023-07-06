import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import isEmpty from "is-empty";
//SUB COMPONENTS
import SpinnerCard from "../../../misc/SpinnerCard";
import TrashTableContainer from "../TrashTableContainer";
import TrashInfo from "../TrashInfo";
//UTILS
import { getAppMode, getUserAuthDetails } from "../../../../store/selectors";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import { getAllRecordsFromTrash } from "utils/trash/TrashUtils";
import { StorageService } from "init";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import { isExtensionInstalled } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import Logger from "lib/logger";

const TrashIndexPage = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const trashLimit = 30; // days
  //Component State
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(false);

  const fetchTrashRules = (user) => {
    setLoadingRecords(true);
    setError(false);
    setRecords([]);
    getAllRecordsFromTrash(user.details.profile.uid, trashLimit).then((result) => {
      if (result.success) {
        setRecords(result.data);
      } else {
        setError(true);
      }
      setLoadingRecords(false);
    });
  };

  const updateTrash = (selectedRules) => {
    setLoadingRecords(true);
    const updatedRecords = [];

    records.forEach((record) => {
      if (!selectedRules.some((rule) => rule.id === record.id)) {
        updatedRecords.push(record);
      }
    });

    setRecords((records) => updatedRecords);
    setLoadingRecords(false);
  };

  const stableUpdateCollection = useCallback(fetchTrashRules, [trashLimit]);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log("Reading storage in TrashIndexPage useEffect");
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            setIsExtensionEnabled(value.isExtensionEnabled);
          } else {
            setIsExtensionEnabled(true);
          }
        });
    }
  }, [appMode]);

  useEffect(() => {
    if (user.loggedIn && user.details.profile) {
      stableUpdateCollection(user);
    } else {
      setLoadingRecords(false);
    }
  }, [user, stableUpdateCollection]);

  if (!isExtensionEnabled) {
    return <ExtensionDeactivationMessage />;
  }

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled()) {
    return <InstallExtensionCTA eventPage="trash_page" />;
  }

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="Trash" />;

  return loadingRecords ? (
    <SpinnerCard customLoadingMessage="Loading deleted rules" />
  ) : !isEmpty(records) ? (
    <TrashTableContainer updateTrash={updateTrash} records={records} />
  ) : (
    <TrashInfo error={error} />
  );
};
export default TrashIndexPage;
