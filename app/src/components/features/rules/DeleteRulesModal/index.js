import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
//ACTIONS
import { deleteGroupsFromStorage, deleteRulesFromStorage } from "./actions";
import { unselectAllRules } from "../actions";
import { toast } from "utils/Toast.js";
import { addRecordsToTrash } from "utils/trash/TrashUtils";
import DeleteConfirmationModal from "components/user/DeleteConfirmationModal";
import { actions } from "store";
import { getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import {
  trackRulesTrashedEvent,
  trackRulesDeletedEvent,
} from "modules/analytics/events/common/rules";

const DeleteRulesModal = (props) => {
  const {
    toggle: toggleDeleteRulesModal,
    isOpen,
    ruleIdsToDelete,
    recordsToDelete,
    clearSearch,
    handleNavigationAfterDelete,
  } = props;

  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);

  //Component State
  const [areRulesMovingToTrash, setAreRulesMovingToTrash] = useState(false);
  const [areRulesBeingDeleted, setAreRulesBeingDeleted] = useState(false);

  const getGroupsIdsToDelete = () => {
    const groupwiseRulesToPopulateCopy = JSON.parse(
      JSON.stringify(groupwiseRulesToPopulate)
    );
    const groupIdsToDelete = new Set();

    const groupwiseRules = { ...groupwiseRulesToPopulateCopy };

    recordsToDelete.forEach((record) => {
      const rulesGroupArray = groupwiseRules[record.groupId]["group_rules"];
      const ruleIndex = rulesGroupArray.findIndex((rule) => {
        return rule.id === record.id;
      });
      if (ruleIndex !== -1) {
        rulesGroupArray.splice(ruleIndex, 1);
      }
    });

    for (const groupId in groupwiseRules) {
      const groupRulesArray = groupwiseRules[groupId]["group_rules"];
      if (groupRulesArray.length === 0) {
        groupIdsToDelete.add(groupId);
      }
    }
    return [...groupIdsToDelete];
  };

  const handleGroupsDeletion = async (groupIdsToDelete) => {
    return deleteGroupsFromStorage(appMode, groupIdsToDelete);
  };

  const handleRulesDeletion = async (uid) => {
    if (!uid) return;
    setAreRulesMovingToTrash(true);
    return addRecordsToTrash(uid, recordsToDelete).then((result) => {
      return new Promise((resolve, reject) => {
        if (result.success) {
          deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
            stablePostDeletionSteps();
            toast.info(`Moved selected rules to trash`);
            trackRulesTrashedEvent(ruleIdsToDelete.length);
            trackRQLastActivity("rules_deleted");
            trackRulesDeletedEvent(ruleIdsToDelete.length);
            return resolve();
          });
        } else {
          toast.info(`Could not delete rule, please try again later.`);
          reject();
        }
      });
    });

    // // Reachable Code since now user must always be authenticated
    // setAreRulesBeingDeleted(true);
    // deleteRulesFromStorage(appMode, ruleIdsToDelete, stablePostDeletionSteps);
    // toast.info(`Deleted selected rules.`);
  };

  const handleDeleteRulesPermanently = async () => {
    const groupIdsToDelete = getGroupsIdsToDelete();

    await deleteRulesFromStorage(appMode, ruleIdsToDelete, () => {
      toast.info(`Rules deleted permanently!`);
      trackRQLastActivity("rules_deleted");
      trackRulesDeletedEvent(ruleIdsToDelete.length);
    });

    await deleteGroupsFromStorage(appMode, groupIdsToDelete);
    stablePostDeletionSteps();
  };

  const handleRecordsDeletion = async (uid) => {
    const groupIdsToDelete = getGroupsIdsToDelete();

    await handleRulesDeletion(uid);
    await handleGroupsDeletion(groupIdsToDelete);
    stablePostDeletionSteps();
  };

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

  const postDeletionSteps = () => {
    //Refresh List
    dispatch(actions.updateHardRefreshPendingStatus({ type: "rules" }));
    // Set loading to false
    setAreRulesMovingToTrash(false);
    setAreRulesBeingDeleted(false);

    //clear search
    clearSearch?.();

    //Close Modal
    toggleDeleteRulesModal();
    handleNavigationAfterDelete?.();

    //Unselect all rules
    unselectAllRules(dispatch);
  };

  const stablePostDeletionSteps = useCallback(postDeletionSteps, [
    dispatch,
    toggleDeleteRulesModal,
    handleNavigationAfterDelete,
    clearSearch,
  ]);

  // useEffect(() => {
  //   return stablePostDeletionSteps;
  // }, [deleteRulesCompleted, ruleIdsToDelete, stablePostDeletionSteps, appMode]);

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      toggle={toggleDeleteRulesModal}
      ruleIdsToDelete={ruleIdsToDelete}
      rulesToDelete={recordsToDelete}
      promptToLogin={promptUserToLogin}
      handleRecordsDeletion={handleRecordsDeletion}
      handleDeleteRulesPermanently={handleDeleteRulesPermanently}
      isMoveToTrashInProgress={areRulesMovingToTrash}
      isDeletionInProgress={areRulesBeingDeleted}
    />
  );
};

export default DeleteRulesModal;
