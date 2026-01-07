import { RunOrder } from "./types";

/**
 * Patches the runOrder by filtering out stale IDs and adding new ones
 * @param currentRunOrder - The current run order
 * @param requestIds - Array of request IDs to patch with
 * @returns The patched run order
 */
export const patchRunOrder = (currentRunOrder: RunOrder, requestIds: string[]): RunOrder => {
  const incomingRequestSet = new Set(requestIds);
  // Remove stale ids from existing order
  const filteredRunOrder = currentRunOrder.filter((value) => incomingRequestSet.has(value.id));
  const filteredRunOrderIds = filteredRunOrder.map((value) => value.id);

  const filteredRunOrderSet = new Set(filteredRunOrderIds);
  const patch: RunOrder = [];
  for (const requestId of requestIds) {
    if (!filteredRunOrderSet.has(requestId)) {
      // Assuming all incoming requests are selected
      patch.push({ id: requestId, isSelected: true });
    }
  }

  return [...filteredRunOrder, ...patch];
};
