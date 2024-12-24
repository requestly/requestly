import { Completion, CompletionSource } from "@codemirror/autocomplete";
import { generateCompletionSource } from ".";

export interface MethodDetails {
  name: string; // name of the method
  docstring?: string; // brief explanation of the method
  signature?: string; // the method signature // AI GENERATED - TODO: PROBABLY DOESN'T WORK
}

interface NameSpaceConfig {
  prefixMatchPattern: RegExp;
  lengthOfPrefix: number;
}
/* GENERATE THE `CompleteSource` INTERFACE FOR FUNCTION SPECIFIED HERE UNDER THE `rq.` prefix */
export default function generateRQNamespaceCompletions(
  methods: MethodDetails[],
  config?: NameSpaceConfig
): CompletionSource {
  const rqNamespaceCompletions = methods.map((method) => {
    return {
      label: method.name,
      detail: method.signature,
      type: "RQ Namespace",
      info: method.docstring,
    } as Completion;
  });
  let matchPattern = /rq\..*?/g;
  let length = 3;

  if (config) {
    matchPattern = config.prefixMatchPattern;
    length = config.lengthOfPrefix;
  }
  return generateCompletionSource(matchPattern, rqNamespaceCompletions, length);
}
