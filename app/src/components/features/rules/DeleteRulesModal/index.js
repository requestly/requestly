import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteGroupsFromStorage, deleteRulesFromStorage } from "./actions";
import { toast } from "utils/Toast.js";
import { addRecordsToTrash } from "utils/trash/TrashUtils";
import DeleteConfirmationModal from "components/user/DeleteConfirmationModal";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "store/selectors";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRulesTrashedEvent, trackRulesDeletedEvent } from "modules/analytics/events/common/rules";
import { deleteTestReportByRuleId } from "../TestThisRule/utils/testReports";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { trackSampleRuleDeleted } from "features/rules/analytics";

const DeleteRulesModal = ({
  toggle: toggleDeleteRulesModal,
  isOpen,
  rulesToDelete,
  groupIdsToDelete = [],
  clearSearch,
  ruleDeletedCallback = () => {},
  analyticEventSource = "",
}) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const enableTrash = useFeatureIsOn("enable-trash");

  //Component State
  const [areRulesMovingToTrash, setAreRulesMovingToTrash] = useState(false);
  const [areRulesBeingDeleted, setAreRulesBeingDeleted] = useState(false);

  const ruleIdsToDelete = useMemo(() => rulesToDelete.map((rule) => rule.id), [rulesToDelete]);

  const handleDeleteRuleTestReports = useCallback(async () => {
    deleteTestReportByRuleId(appMode, ruleIdsToDelete);
  }, [appMode, ruleIdsToDelete]);

  const postDeletionSteps = useCallback(() => {
    //Delete test reports for ruleIdsToDelete
    handleDeleteRuleTestReports();
    //Refresh List
    dispatch(globalActions.updateHardRefreshPendingStatus({ type: "rules" }));
    // Set loading to false
    setAreRulesMovingToTrash(false);
    setAreRulesBeingDeleted(false);

    //clear search
    clearSearch?.();

    const isSampleRules = rulesToDelete.some((rule) => rule.isSample);
    if (isSampleRules) {
      trackSampleRuleDeleted();
    }

    //Close Modal
    toggleDeleteRulesModal();
    ruleDeletedCallback?.();

    //Unselect all rules
    dispatch(globalActions.clearSelectedRecords());
  }, [dispatch, toggleDeleteRulesModal, ruleDeletedCallback, clearSearch, handleDeleteRuleTestReports, rulesToDelete]);

  const handleDeleteRulesPermanently = useCallback(async () => {
    await deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
      toast.info(`Rules deleted permanently!`);
      trackRQLastActivity("rules_deleted");
      trackRulesDeletedEvent(ruleIdsToDelete.length, analyticEventSource, "permanent");
    });
  }, [appMode, ruleIdsToDelete, analyticEventSource]);

  const handleRulesDeletion = useCallback(
    async (uid) => {
      if (enableTrash) {
        if (!uid) return;
        setAreRulesMovingToTrash(true);
        return addRecordsToTrash(uid, rulesToDelete).then((result) => {
          return new Promise((resolve, reject) => {
            if (result.success) {
              deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
                toast.info(`Moved selected rules to trash`);
                trackRulesTrashedEvent(ruleIdsToDelete.length);
                trackRQLastActivity("rules_deleted");
                trackRulesDeletedEvent(ruleIdsToDelete.length, analyticEventSource, "trash");
                return resolve();
              });
            } else {
              toast.info(`Could not delete rule, please try again later.`);
              setAreRulesMovingToTrash(false);
              reject();
            }
          });
        });
      } else {
        handleDeleteRulesPermanently();
      }
    },
    [appMode, enableTrash, handleDeleteRulesPermanently, ruleIdsToDelete, rulesToDelete, analyticEventSource]
  );

  const handleRecordsDeletion = useCallback(
    async (uid) => {
      await handleRulesDeletion(uid);
      await deleteGroupsFromStorage(
        appMode,
        groupIdsToDelete.filter((id) => id !== RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID)
      );
      postDeletionSteps();
    },
    [handleRulesDeletion, postDeletionSteps, appMode, groupIdsToDelete]
  );

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      toggle={toggleDeleteRulesModal}
      ruleIdsToDelete={ruleIdsToDelete}
      handleRecordsDeletion={handleRecordsDeletion}
      handleDeleteRulesPermanently={handleDeleteRulesPermanently}
      isMoveToTrashInProgress={areRulesMovingToTrash}
      isDeletionInProgress={areRulesBeingDeleted}
    />
  );
};

export default DeleteRulesModal;
