import { getRulesAndGroupsFromRuleIds } from "utils/rules/misc";
import { getFunctions, httpsCallable } from "firebase/functions";
import { SharedLinkVisibility, SharedListData } from "./types";
import { Group, Rule } from "types";

export const createSharedList = async (
  appMode: string,
  rulesIdsToShare: string[],
  sharedListName: string,
  groupwiseRules: Record<string, Group>,
  sharedListVisibility: SharedLinkVisibility,
  sharedListRecipients: unknown
) => {
  const { rules, groups } = await getRulesAndGroupsFromRuleIds(appMode, rulesIdsToShare, groupwiseRules);

  const updatedGroups = groups.map((group: Group) => ({
    ...group,
    children: [] as Rule[],
  }));

  const sharedListData: SharedListData = {
    rules,
    updatedGroups,
    sharedListName,
    sharedListVisibility,
    sharedListRecipients,
  };

  const res = (await generateSharedList(sharedListData)) as any;

  return {
    sharedListId: res.sharedListId,
    sharedListName: res.sharedListName,
    sharedListData: res.sharedListData,
    nonRQEmails: res.nonRQEmails,
  };
};

const generateSharedList = async (sharedListData: SharedListData) => {
  const functions = getFunctions();
  const createSharedList = httpsCallable(functions, "sharedLists-create");
  const res = await createSharedList(sharedListData);
  return res.data;
};
