import { generateObjectId } from "utils/FormattingHelper";
import { Rule } from "@requestly/shared/types/entities/rules";

// Helper function to create a base rule with default values
const getBaseRule = (props: any = {}) => {
  return {
    id: "",
    objectType: "rule",
    name: "",
    description: "",
    creationDate: "",
    ruleType: "",
    status: "Active",
    groupId: "",
    isSample: false,
    ...props,
  };
};

type FileInjectRule = {
  type: "fileInject";
  fileName: string;
  file: string;
  fileId: string;
  fileType: "js" | "css";
  injectLocation: "head" | "body";
  on: boolean;
};

type HeaderRule = {
  type: "headerRule";
  match: string;
  requestRules?: string;
  responseRules?: string;
  on: boolean;
};

type NormalOverrideRule = {
  type: "normalOverride";
  match: string;
  replace: string;
  on: boolean;
};

type FileOverrideRule = {
  type: "fileOverride";
  match: string;
  file: string;
  fileId: string;
  on: boolean;
};

type ResourceOverrideRules = FileInjectRule | HeaderRule | NormalOverrideRule | FileOverrideRule;

type DataItem = {
  id: string;
  matchUrl: string;
  rules: ResourceOverrideRules[];
  on: boolean;
};

type Config = {
  v: number;
  data: DataItem[];
};

export const parseRulesFromResourceOverride = (resourceOverrideData: Config): Rule[] => {
  const requestlyExport: any[] = [];

  resourceOverrideData.data?.forEach((resource) => {
    const matchUrl = resource.matchUrl;
    resource.rules?.forEach((rule) => {
      const requestlyRule: any = getBaseRule({
        creationDate: Date.now(),
        lastModifiedBy: "",
        modificationDate: Date.now(),
        schemaVersion: "4.0.0",
        groupId: "",
      });

      if (rule.type === "fileInject") {
        requestlyRule.name = `${rule.fileName}-${Math.random().toString().slice(2, 15)}`;
        requestlyRule.id = `Script_${generateObjectId()}`;
        requestlyRule.ruleType = "Script";
        requestlyRule.pairs = [
          {
            id: `${generateObjectId()}`,
            libraries: [],
            scripts: [
              {
                attributes: [{ name: "type", value: rule.fileType === "js" ? "text/javascript" : "text/css" }],
                codeType: rule.fileType,
                id: `scr_${generateObjectId()}`,
                loadTime: rule.injectLocation === "head" ? "beforePageLoad" : "afterPageLoad",
                type: "code",
                value: rule.file,
              },
            ],
            source: {
              filters: [{}],
              key: "Url",
              operator: "Contains",
              value: matchUrl,
            },
          },
        ];
      } else if (rule.type === "headerRule") {
        requestlyRule.name = `Header_${Math.random().toString().slice(2, 15)}`;
        requestlyRule.id = `Header_${Math.random().toString().slice(2, 15)}`;
        requestlyRule.ruleType = "Headers";
        requestlyRule.version = 3;
        requestlyRule.pairs = [
          {
            id: `${generateObjectId()}`,
            modifications: {
              Request: rule.requestRules.split(";")?.map((header) => {
                if (!header) return;
                const operation = header?.split(" ")[0];
                const type = operation === "set" ? "Modify" : operation === "remove" ? "Remove" : undefined;
                const headerkey = header?.split(" ")[1]?.replace(":", "");
                const value = header?.split(" ")[2];
                return {
                  header: headerkey,
                  id: `${generateObjectId()}`,
                  type: type,
                  value: value ? value : "",
                };
              }),
              Response: rule.responseRules.split(";")?.map((header) => {
                if (!header) return;
                const operation = header?.split(" ")[0];
                const type = operation === "set" ? "Modify" : operation === "remove" ? "Remove" : undefined;
                const headerkey = header?.split(" ")[1]?.replace(":", "");
                const value = header?.split(" ")[2];
                return {
                  header: headerkey,
                  id: `${generateObjectId()}`,
                  type: type,
                  value: value ? value : "",
                };
              }),
            },
            source: {
              filters: [{}],
              key: "Url",
              operator: "Contains",
              value: resource.matchUrl,
            },
          },
        ];
      } else if (rule.type === "normalOverride") {
        requestlyRule.name = `override_${Math.random().toString().slice(2, 15)}`;
        requestlyRule.id = `redirect_${Math.random().toString().slice(2, 15)}`;
        requestlyRule.ruleType = "Redirect";
        const matchURL = rule.match;
        const one_star = matchURL.replace(/\*+/g, "*");

        // New fix
        const matches = matchURL.match(/\*+/g);
        const variableObj: any = {};
        matches?.forEach((i, index) => {
          if (!variableObj[i]) variableObj[i] = index + 2;
        });
        const replaceURL = rule.replace.replace(/\*+/g, (match) => `$${variableObj[match] || match}`);
        requestlyRule.pairs = [
          {
            destination: replaceURL,
            destinationType: "url",
            id: `${generateObjectId()}`,
            source: {
              filters: [],
              key: "Url",
              operator: "Wildcard_Matches",
              value: one_star,
            },
          },
        ];
      } else {
        return;
      }
      requestlyExport.push(requestlyRule);
    });
  });

  return requestlyExport;
};
