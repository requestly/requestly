import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import {
  Rule,
  RuleType,
  RuleSourceKey,
  HeaderRule,
  RuleSourceOperator,
  RecordStatus,
  RecordType,
} from "@requestly/shared/types/entities/rules";
import { ExtensionRule, HeaderOperation, RuleActionType } from "modules/extension/types";

export const getHeaderModificationConfig = async (
  headers: { header: string; value: string }[],
  headerType: "Request" | "Response",
  operation: "add" | "remove"
): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    try {
      if (!headers || headers.length === 0) {
        reject(new Error("No headers provided"));
        return;
      }

      const modificationType =
        operation === "remove" ? HeaderRule.ModificationType.REMOVE : HeaderRule.ModificationType.ADD;

      const modifications: HeaderRule.Modification[] = headers.map((headerInfo, index) => ({
        header: headerInfo.header,
        value: headerInfo.value,
        type: modificationType,
        id: `${Date.now()}_${index}`,
      }));

      const newHeaderRule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;

      newHeaderRule.name = `[Automated Multi-Header Rule]`;
      newHeaderRule.description = `${operation} ${headers.length} ${headerType.toLowerCase()} header(s)`;
      newHeaderRule.status = RecordStatus.ACTIVE;
      newHeaderRule.creationDate = Date.now();
      newHeaderRule.modificationDate = Date.now();

      newHeaderRule.createdBy = "Automated-USER";
      newHeaderRule.currentOwner = "Automated-USER";
      newHeaderRule.lastModifiedBy = "Automated-USER";
      newHeaderRule.groupId = "";
      newHeaderRule.isSample = false;
      (newHeaderRule as any).objectType = RecordType.RULE;
      (newHeaderRule as any).schemaVersion = "3.0.0";
      (newHeaderRule as any).version = 2;

      const headerPair = newHeaderRule.pairs[0];
      headerPair.id = Math.random().toString(36).slice(2, 5);
      headerPair.modifications = {
        Request: headerType === "Request" ? modifications : [],
        Response: headerType === "Response" ? modifications : [],
      };

      headerPair.source = {
        key: RuleSourceKey.URL,
        operator: RuleSourceOperator.CONTAINS,
        value: "",
      };

      const extensionRule: ExtensionRule = {
        condition: {
          excludedInitiatorDomains: ["requestly.io"],
          excludedRequestDomains: ["requestly.io"],
          isUrlFilterCaseSensitive: true,
          regexFilter: ".*",
        },
        action: {
          type: RuleActionType.MODIFY_HEADERS,
        },
      };

      if (headerType === "Request") {
        extensionRule.action.requestHeaders = headers.map((headerInfo) => ({
          header: headerInfo.header,
          operation: operation === "add" ? HeaderOperation.SET : HeaderOperation.REMOVE,
          value: operation === "add" ? headerInfo.value : undefined,
        }));
      } else {
        extensionRule.action.responseHeaders = headers.map((headerInfo) => ({
          header: headerInfo.header,
          operation: operation === "add" ? HeaderOperation.SET : HeaderOperation.REMOVE,
          value: operation === "add" ? headerInfo.value : undefined,
        }));
      }

      (newHeaderRule as any).extensionRules = [extensionRule];

      resolve([newHeaderRule]);
    } catch (error) {
      reject(error);
    }
  });
};
