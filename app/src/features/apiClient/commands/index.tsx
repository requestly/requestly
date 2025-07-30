import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { bindCommands } from "./bindCommands";
import { useMemo } from "react";

const commands = {
  /* todo: add commands and scope */
};

export function useCommand() {
  const ctx = useApiClientFeatureContext();

  return useMemo(() => bindCommands(ctx, commands), [ctx]);
}
