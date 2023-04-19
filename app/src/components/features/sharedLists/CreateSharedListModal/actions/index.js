//UTILS
// import { generateSharedListId } from "../../../../../utils/FormattingHelper";
import { getRulesAndGroupsFromRuleIds } from "../../../../../utils/rules/misc";
// import {
//   getPublicSharedListPath,
//   getUserSharedListsPath,
// } from "../../../../../utils/db/UserModel";
// import DataStoreUtils from "../../../../../utils/DataStoreUtils";
// import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { getFunctions, httpsCallable } from "firebase/functions";

export const createSharedList = (
  appMode,
  rulesIdsToShare,
  sharedListName,
  groupwiseRules,
  sharedListVisibility,
  sharedListRecipients,
  uid
) => {
  return new Promise((resolve) => {
    //Fetch rules and groups that would be stored in this shared list
    getRulesAndGroupsFromRuleIds(appMode, rulesIdsToShare, groupwiseRules).then(({ rules, groups }) => {
      const updatedGroups = groups.map((group) => ({
        ...group,
        children: [],
      }));

      generateSharedList({
        rules,
        updatedGroups,
        sharedListName,
        sharedListVisibility,
        sharedListRecipients,
      }).then(({ sharedListId, sharedListName, sharedListData, nonRQEmails }) => {
        resolve({
          sharedListId,
          sharedListName,
          sharedListData,
          nonRQEmails,
        });
      });
    });
  });
};

export const modifySharedList = async (listProperty, updatedValue, sharedListId) => {
  const functions = getFunctions();
  const updateList = httpsCallable(functions, "sharedLists-modify");
  return await updateList({
    listProperty,
    updatedValue,
    sharedListId,
  });
};

const generateSharedList = async (sharedListData) => {
  const functions = getFunctions();
  const createSharedList = httpsCallable(functions, "sharedLists-create");
  const res = await createSharedList(sharedListData);
  return res.data;
};
