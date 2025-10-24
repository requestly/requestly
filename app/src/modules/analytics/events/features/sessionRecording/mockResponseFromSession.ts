import { trackEvent } from "modules/analytics";
import { SESSION_RECORDING } from "../constants";

export function trackMockResponsesButtonClicked() {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_BUTTON_CLICKED);
}

export function trackMockResponsesResourceTypeSelected(resource_type: string) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_RESOURCE_TYPE_SELECTED, {
    resource_type,
  });
}

export function trackMockResponsesTargetingSelecting(target_condition: string) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_TARGETING_CONDITIONS_SELECTED, {
    target_condition,
  });
}

export function trackMockResponsesGraphQLKeyEntered(operationKeyPairs: { key: string; value: string }[]) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_GRAPHQL_KEY_ENTERED, {
    operationKeys: operationKeyPairs,
  });
}

export function trackMockResponsesRequestsSelected(count: number) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_REQUESTS_SELECTED, {
    count,
  });
}

export function trackMockResponsesCreateRulesClicked(count: number) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_CREATE_RULES_CLICKED, {
    count,
  });
}

export function trackMockResponsesRuleCreationStarted(count: number) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_RULE_CREATION_STARTED, {
    count,
  });
}

export function trackMockResponsesRuleCreationCompleted(count: number, group_id: string, group_name: string) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_RULE_CREATION_COMPLETED, {
    count,
    group_id,
    group_name,
  });
}

export function trackMockResponsesRuleCreationFailed(count: number) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_RULE_CREATION_FAILED, {
    count,
  });
}

export function trackMockResponsesViewNowClicked(group_id: string, group_name: string) {
  trackEvent(SESSION_RECORDING.MOCK_RESPONSES.MOCK_RESPONSES_VIEW_NOW_CLICKED, {
    group_id,
    group_name,
  });
}
