import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { bindCommands } from "./bindCommands";
import { useMemo } from "react";
import * as envCommands from "./environments";
import * as apiRecordCommands from "./records";

const commands = {
  env: envCommands,
  api: apiRecordCommands,
};

export function useCommand() {
  const ctx = useApiClientFeatureContext();

  return useMemo(() => bindCommands(ctx, commands), [ctx]);
}
