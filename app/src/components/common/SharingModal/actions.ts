import { getRulesAndGroupsFromRuleIds } from "utils/rules/misc";
import { getFunctions, httpsCallable } from "firebase/functions";
import { SharedLinkVisibility, SharedListData } from "./types";
import { Group, Rule } from "types";
import { StorageService } from "init";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { generateObjectId } from "utils/FormattingHelper";
import { getOwnerId } from "backend/utils";

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

  const sharedList = (await generateSharedList(sharedListData)) as any;

  return {
    sharedListId: sharedList.sharedListId,
    sharedListName: sharedList.sharedListName,
    sharedListData: sharedList.sharedListData,
    nonRQEmails: sharedList.nonRQEmails,
  };
};

const generateSharedList = async (sharedListData: SharedListData) => {
  const functions = getFunctions();
  const createSharedList = httpsCallable(functions, "sharedLists-create");
  const newSharedList = await createSharedList(sharedListData);
  return newSharedList.data;
};

export const prepareContentToExport = (
  appMode: string,
  selectedRuleIds: string[],
  groupwiseRules: Record<string, Group>
) => {
  return new Promise((resolve, reject) => {
    getRulesAndGroupsFromRuleIds(appMode, selectedRuleIds, groupwiseRules).then(({ rules, groups }) => {
      const updatedGroups = groups.map((group: Group) => ({
        ...group,
        children: [] as Rule[],
      }));
      resolve({
        fileContent: JSON.stringify(rules.concat(updatedGroups), null, 2),
        rulesCount: rules.length,
        groupsCount: updatedGroups.length,
      });
    });
  });
};

export const duplicateRulesToTargetWorkspace = async (
  appMode: string,
  workspaceId: string, // is workspace non null??
  ruleIdsToShare: string[],
  groupwiseRules: Record<string, Group>
) => {
  const { rules, groups } = await getRulesAndGroupsFromRuleIds(appMode, ruleIdsToShare, groupwiseRules);

  // mapping of old group IDs to new group IDs
  const groupIdMapping: Record<string, string> = {};

  const uid = window.uid;

  const formatRule = (rule: Rule, newGroupId: string) => ({
    ...rule,
    creationDate: generateObjectCreationDate(),
    modificationDate: generateObjectCreationDate(),
    name: `${rule.name} Copy`,
    id: `${rule.ruleType}_${generateObjectId()}`,
    groupId: newGroupId,
    originalCreator: rule.createdBy ?? null,
    createdBy: uid,
    currentOwner: getOwnerId(uid, workspaceId),
  });

  const formattedGroups = groups.reduce((acc: Group[], group: Group) => {
    const newGroupId = `Group_${generateObjectId()}`;
    groupIdMapping[group.id] = newGroupId;
    acc.push({
      ...group,
      id: newGroupId,
      name: `${group.name} Copy`,
      createdBy: uid,
      currentOwner: getOwnerId(uid, workspaceId),
    });
    return acc;
  }, []);

  const formattedRules = rules.map((rule: Rule) => {
    const newGroupId = groupIdMapping[rule.groupId] || "";
    return formatRule(rule, newGroupId);
  });

  return StorageService(appMode).saveMultipleRulesOrGroups([...formattedRules, ...formattedGroups], { workspaceId });
};
