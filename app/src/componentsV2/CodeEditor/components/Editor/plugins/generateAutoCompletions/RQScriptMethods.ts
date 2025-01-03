import { Completion, CompletionSource } from "@codemirror/autocomplete";
import { generateCompletionSource } from ".";

export interface MethodDetails {
  name: string; // name of the method
  docstring?: string; // brief explanation of what the method/attribute is about
  signature?: string; // doesn't provide intellisense, but is used to display the method signature in the completion dropdown
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
  let matchPattern = /rq\.$/g;
  let length = 3;

  if (config) {
    matchPattern = config.prefixMatchPattern;
    length = config.lengthOfPrefix;
  }
  return generateCompletionSource(matchPattern, rqNamespaceCompletions, length);
}
