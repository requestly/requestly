import { RuleType } from "types";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { ReactNode } from "react";

// TODO: update details
export const RULE_DETAILS: Record<
  RuleType,
  {
    type: RuleType;
    name: string;
    icon: () => ReactNode;
    description: string;
    useCases?: { useCase: string; suggestedTemplateLink?: string }[];
    documentationLink: string;
  }
> = {
  [RuleType.REDIRECT]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local).",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts.",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.CANCEL]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.DELAY]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.HEADERS]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.QUERYPARAM]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.REPLACE]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.REQUEST]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.RESPONSE]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.SCRIPT]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
  [RuleType.USERAGENT]: {
    type: RuleType.REDIRECT,
    name: RULE_TYPES_CONFIG[RuleType.REDIRECT].NAME,
    icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
    description: RULE_TYPES_CONFIG[RuleType.REDIRECT].DESCRIPTION,
    useCases: [
      {
        useCase: "Redirect Production to Local Environment.",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Redirect to local System files (Map Local)",
        suggestedTemplateLink: "",
      },
      {
        useCase: "Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts",
        suggestedTemplateLink: "",
      },
    ],
    documentationLink: "https://developers.requestly.com/http-rules/map-local-url-redirect",
  },
};
