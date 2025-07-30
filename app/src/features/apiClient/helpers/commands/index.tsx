import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { NativeError } from "errors/NativeError";
import { sampleCmd1, sampleCmd2, sampleCmd3, sampleCmd4, sampleCmd5 } from "./sampleCommands";
import { bindCommands } from "./bindCommands";

const commands = {
  // just a sample
  env: {
    something: {
      cmd1: sampleCmd1,
    },
    cmd2: sampleCmd2,
  },
  cmd3: sampleCmd3,
  records: {
    cmd4: sampleCmd4,
    cmd5: sampleCmd5,
  },
};

export function useCommand() {
  const ctx = useApiClientFeatureContext();

  if (!ctx.stores) {
    throw new NativeError("Command can't be called before stores are initialized");
  }

  return bindCommands(ctx, commands);
}
