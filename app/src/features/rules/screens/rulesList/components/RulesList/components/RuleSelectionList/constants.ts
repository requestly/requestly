import React from "react";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RuleType } from "@requestly/shared/types/entities/rules";

enum RuleCategories {
  URL_REWRITES = "urlRewrites",
  APIS = "apis",
  HEADERS = "headers",
  OTHERS = "others",
}

type RuleInfo = {
  title: string;
  type: RuleType;
  icon: () => React.ReactNode;
  description: string;
};

type RuleDetails = {
  categories: {
    title: string;
    type: RuleCategories;
    rules: RuleInfo[];
  }[];
};

export const RULE_DETAILS: RuleDetails = {
  categories: [
    {
      title: "URL rewrites",
      type: RuleCategories.URL_REWRITES,
      rules: [
        {
          type: RuleType.REDIRECT,
          title: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
          description: "Map Local or Redirect a matching pattern to a URL",
        },
        {
          type: RuleType.REPLACE,
          title: RULE_TYPES_CONFIG[RuleType.REPLACE].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.REPLACE].ICON,
          description: RULE_TYPES_CONFIG[RuleType.REPLACE].DESCRIPTION,
        },
        {
          type: RuleType.QUERYPARAM,
          title: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].ICON,
          description: RULE_TYPES_CONFIG[RuleType.QUERYPARAM].DESCRIPTION,
        },
      ],
    },
    {
      title: "API mocking",
      type: RuleCategories.APIS,
      rules: [
        {
          type: RuleType.REQUEST,
          title: RULE_TYPES_CONFIG[RuleType.REQUEST].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.REQUEST].ICON,
          description: "Override Body of POST requests",
        },
        {
          type: RuleType.RESPONSE,
          title: RULE_TYPES_CONFIG[RuleType.RESPONSE].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.RESPONSE].ICON,
          description: RULE_TYPES_CONFIG[RuleType.RESPONSE].DESCRIPTION,
        },
      ],
    },
    {
      title: "Headers",
      type: RuleCategories.HEADERS,
      rules: [
        {
          type: RuleType.HEADERS,
          title: RULE_TYPES_CONFIG[RuleType.HEADERS].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.HEADERS].ICON,
          description: RULE_TYPES_CONFIG[RuleType.HEADERS].DESCRIPTION,
        },
        {
          type: RuleType.USERAGENT,
          title: RULE_TYPES_CONFIG[RuleType.USERAGENT].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.USERAGENT].ICON,
          description: RULE_TYPES_CONFIG[RuleType.USERAGENT].DESCRIPTION,
        },
      ],
    },
    {
      title: "Others",
      type: RuleCategories.OTHERS,
      rules: [
        {
          type: RuleType.SCRIPT,
          title: RULE_TYPES_CONFIG[RuleType.SCRIPT].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.SCRIPT].ICON,
          description: "Inject Custom JS or CSS to any website",
        },
        {
          type: RuleType.CANCEL,
          title: RULE_TYPES_CONFIG[RuleType.CANCEL].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.CANCEL].ICON,
          description: RULE_TYPES_CONFIG[RuleType.CANCEL].DESCRIPTION,
        },
        {
          type: RuleType.DELAY,
          title: RULE_TYPES_CONFIG[RuleType.DELAY].NAME,
          icon: RULE_TYPES_CONFIG[RuleType.DELAY].ICON,
          description: "Introduce a lag to the response from specific URLs",
        },
      ],
    },
  ],
};
