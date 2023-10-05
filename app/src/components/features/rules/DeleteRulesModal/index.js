import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteGroupsFromStorage, deleteRulesFromStorage } from "./actions";
import { unselectAllRecords } from "../actions";
import { toast } from "utils/Toast.js";
import { addRecordsToTrash } from "utils/trash/TrashUtils";
import DeleteConfirmationModal from "components/user/DeleteConfirmationModal";
import { actions } from "store";
import { getAppMode } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRulesTrashedEvent, trackRulesDeletedEvent } from "modules/analytics/events/common/rules";
import { deleteTestReportByRuleId } from "../TestThisRule/helpers";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";

const DeleteRulesModal = ({
  toggle: toggleDeleteRulesModal,
  isOpen,
  rulesToDelete,
  groupIdsToDelete = [],
  clearSearch,
  ruleDeletedCallback,
}) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  //Component State
  const [areRulesMovingToTrash, setAreRulesMovingToTrash] = useState(false);
  const [areRulesBeingDeleted, setAreRulesBeingDeleted] = useState(false);

  const ruleIdsToDelete = useMemo(() => rulesToDelete.map((rule) => rule.id), [rulesToDelete]);

  const handleDeleteRuleTestReports = useCallback(async () => {
    deleteTestReportByRuleId(appMode, ruleIdsToDelete);
  }, [appMode, ruleIdsToDelete]);

  const postDeletionSteps = () => {
    //Delete test reports for ruleIdsToDelete
    handleDeleteRuleTestReports();
    //Refresh List
    dispatch(actions.updateHardRefreshPendingStatus({ type: "rules" }));
    // Set loading to false
    setAreRulesMovingToTrash(false);
    setAreRulesBeingDeleted(false);

    //clear search
    clearSearch?.();

    //Close Modal
    toggleDeleteRulesModal();
    ruleDeletedCallback?.();

    //Unselect all rules
    unselectAllRecords(dispatch);
  };

  const stablePostDeletionSteps = useCallback(postDeletionSteps, [
    dispatch,
    toggleDeleteRulesModal,
    ruleDeletedCallback,
    clearSearch,
    handleDeleteRuleTestReports,
  ]);

  const handleRulesDeletion = useCallback(
    async (uid) => {
      if (!uid) return;
      setAreRulesMovingToTrash(true);
      return addRecordsToTrash(uid, rulesToDelete).then((result) => {
        return new Promise((resolve, reject) => {
          if (result.success) {
            deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
              toast.info(`Moved selected rules to trash`);
              trackRulesTrashedEvent(ruleIdsToDelete.length);
              trackRQLastActivity("rules_deleted");
              trackRulesDeletedEvent(ruleIdsToDelete.length);
              return resolve();
            });
          } else {
            toast.info(`Could not delete rule, please try again later.`);
            setAreRulesMovingToTrash(false);
            reject();
          }
        });
      });
    },
    [appMode, ruleIdsToDelete, rulesToDelete]
  );

  const handleDeleteRulesPermanently = useCallback(async () => {
    await deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
      toast.info(`Rules deleted permanently!`);
      trackRQLastActivity("rules_deleted");
      trackRulesDeletedEvent(ruleIdsToDelete.length);
    });
  }, [appMode, ruleIdsToDelete]);

  const handleRecordsDeletion = useCallback(
    async (uid) => {
      await handleRulesDeletion(uid);
      await deleteGroupsFromStorage(
        appMode,
        groupIdsToDelete.filter((id) => id !== RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID)
      );
      stablePostDeletionSteps();
    },
    [handleRulesDeletion, stablePostDeletionSteps, appMode, groupIdsToDelete]
  );

  const promptUserToLogin = () => {
    const signInSuccessCallback = (uid) => {
      handleRecordsDeletion(uid);
    };

    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          callback: signInSuccessCallback,
          eventSource: AUTH.SOURCE.DELETE_RULE,
        },
      })
    );
  };

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      toggle={toggleDeleteRulesModal}
      ruleIdsToDelete={ruleIdsToDelete}
      promptToLogin={promptUserToLogin}
      handleRecordsDeletion={handleRecordsDeletion}
      handleDeleteRulesPermanently={handleDeleteRulesPermanently}
      isMoveToTrashInProgress={areRulesMovingToTrash}
      isDeletionInProgress={areRulesBeingDeleted}
    />
  );
};

export default DeleteRulesModal;
