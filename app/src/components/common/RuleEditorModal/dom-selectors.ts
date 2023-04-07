import { RuleType } from 'types';

/**
 * @description  Use it as 'input[data-selectionid="value"]' to focus rule editor fields
 */

export const RULE_EDITOR_FIELD_SELECTOR = {
  [RuleType.HEADERS]: 'header-name',
  [RuleType.REDIRECT]: 'destination-url',
  [RuleType.REPLACE]: 'replace-from-in-url',
  [RuleType.CANCEL]: 'source-value',
  [RuleType.QUERYPARAM]: 'query-param-name',
  [RuleType.USERAGENT]: 'device-selector',
  [RuleType.DELAY]: 'delay-value',
};
