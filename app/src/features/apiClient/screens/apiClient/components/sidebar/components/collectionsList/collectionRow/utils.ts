export enum CollectionRowOptionsCustomEvent {
  OPEN_RUNNER_TAB = "open_runner_tab",
  OPEN_RUN_HISTORY = "open_run_history",
}

export function dispatchCustomEvent(eventName: CollectionRowOptionsCustomEvent) {
  const event = new CustomEvent(eventName);
  window.dispatchEvent(event);
}
