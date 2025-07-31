import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { bindCommands } from "./bindCommands";
import { useMemo } from "react";
import * as envCommands from "./environments";

const commands = {
  env: envCommands,
};

export function useCommand() {
  const ctx = useApiClientFeatureContext();

  return useMemo(() => bindCommands(ctx, commands), [ctx]);
}
