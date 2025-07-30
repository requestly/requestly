import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { NativeError } from "errors/NativeError";
import { sampleCmd1, sampleCmd2, sampleCmd3, sampleCmd4, sampleCmd5 } from "./sampleCommands";
import { bindCommands } from "./bindCommands";

const commands = {
  // strucutre for commands to be added
  env: {
    cmd1: sampleCmd1,
    cmd2: sampleCmd2,
  },
  records: {
    cmd3: sampleCmd3,
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
