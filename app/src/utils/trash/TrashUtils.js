import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { addRulesAndGroupsToStorage } from "components/features/rules/ImportRulesModal/actions";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import * as Sentry from "@sentry/react";

// Adds single record to trash
export const addRecordToTrash = async (uid, record) => {
  try {
    record.groupId = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;
    record.status = GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE;
    const database = getFirestore();
    const ruleRef = doc(collection(database, `trash/${uid}/rules`), record.id);

    const isRulePresent = (await getDoc(ruleRef)).exists();

    if (isRulePresent) {
      await updateDoc(ruleRef, record);
    } else {
      await setDoc(ruleRef, record);
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// Adds multiple records to trash
export const addRecordsToTrash = async (uid, records) => {
  try {
    const database = getFirestore();
    const batch = writeBatch(database);
    const deletedDate = new Date().getTime();

    records.forEach(async (recordData) => {
      const record = { ...recordData };
      record.deletedDate = deletedDate;
      record.groupId = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;
      record.status = GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE;

      const recordRef = doc(collection(database, `trash/${uid}/rules`), record.id);

      batch.set(recordRef, record);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    Sentry.captureException(new Error(`Trash Error. ${error.toString()}`));
    return { success: false };
  }
};

// Converts number of days to milliseconds to reduce from deletedDate key in a rule
const getLimitTime = (numberOfDays) => {
  return numberOfDays * 1000 * 60 * 60 * 24;
};

const isRuleInTrashDisabled = (rule, limit) => {
  const timestampNow = new Date().getTime();
  const isDisabled = timestampNow - rule.deletedDate >= getLimitTime(limit);

  return isDisabled;
};

const filterTotalRules = (rules) => {
  const filteredRules = rules.filter(
    (rule) => !isRuleInTrashDisabled(rule, APP_CONSTANTS.TRASH_DURATION_OF_DELETED_RULES_TO_SHOW)
  );

  return filteredRules;
};

// Fetches all records from firebase trash
export const getAllRecordsFromTrash = async (uid, limit) => {
  try {
    const database = getFirestore();
    const rulesRef = collection(database, `trash/${uid}/rules`);

    const rulesData = (await getDocs(rulesRef)).docs.map((doc) => doc.data());

    // Adding disabled key for all the rules
    const rulesDataWithDisabledKey = rulesData.map((rule) => ({
      ...rule,
      disabled: isRuleInTrashDisabled(rule, limit),
    }));

    const finalRulesData = filterTotalRules(rulesDataWithDisabledKey);

    return { success: true, data: finalRulesData };
  } catch (error) {
    return { success: false };
  }
};

// Deletes single record from firebase trash
export const deleteRecordFromTrash = async (uid, ruleId) => {
  try {
    const database = getFirestore();
    const ruleRef = doc(collection(database, `trash/${uid}/rules`), ruleId);

    await deleteDoc(ruleRef);

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

// Deletes multiple records from firebase trash
export const deleteRecordsFromTrash = async (uid, records) => {
  try {
    const recordIds = records.map((record) => record.id);
    const database = getFirestore();
    const batch = writeBatch(database);

    recordIds.forEach((recordId) => {
      const recordRef = doc(collection(database, `trash/${uid}/rules`), recordId);
      batch.delete(recordRef);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const importRecordsToLocalStorage = async (appMode, records, uid) => {
  try {
    await addRulesAndGroupsToStorage(appMode, records);
    records.forEach((record) => deleteRecordFromTrash(uid, record.id));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
