import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { NativeError } from "errors/NativeError";
import { bindCommands } from "./bindCommands";
import { useMemo } from "react";

const commands = {
  /* todo: add commands and scope */
};

export function useCommand() {
  const ctx = useApiClientFeatureContext();

  if (!ctx.stores) {
    throw new NativeError("Command can't be called before stores are initialized");
  }

  return useMemo(() => bindCommands(ctx, commands), [ctx]);
}
