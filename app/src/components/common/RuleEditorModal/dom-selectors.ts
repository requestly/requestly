import { RuleType } from 'types';

/**
 * @description Used to focus rule editor fields.
 *
 * @example document.querySelector(`input[data-selectionid="header-name"]`)
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
