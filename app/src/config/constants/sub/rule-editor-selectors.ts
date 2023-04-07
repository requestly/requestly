import { RuleType } from 'types';

export const RULE_EDITOR_FIELD_SELECTOR = {
  [RuleType.HEADERS]: 'header-name',
  [RuleType.REDIRECT]: 'destination-url',
  [RuleType.REPLACE]: 'replace-from-in-url',
  [RuleType.CANCEL]: 'source-value',
  [RuleType.QUERYPARAM]: 'query-param-name',
  [RuleType.USERAGENT]: 'device-selector',
  [RuleType.DELAY]: 'delay-value',
};
