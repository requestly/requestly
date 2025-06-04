import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { WorkerShape } from "@valtown/codemirror-ts/worker";
import * as Comlink from "comlink";

import { linter } from "@codemirror/lint";
import { Diagnostic } from "@codemirror/lint";

import { hoverTooltip, Tooltip } from "@codemirror/view";
import "./style.scss";

async function intializeWorker() {
  const innerWorker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const worker = Comlink.wrap<WorkerShape>(innerWorker);

  await worker.initialize();
  return worker;
}

namespace provider {
  let worker: WorkerShape | null = null;

  export async function getWorker() {
    if (!worker) {
      console.log("DG: Initializing worker");
      worker = await intializeWorker();
    }
    return worker;
  }
}

export const createCompletionOverride = async (editorContext: CompletionContext) => {
  console.log("DG: createCompletionOverride called with context");
  const worker = await provider.getWorker();

  const currentDoc = editorContext.state.doc.toString();

  await worker.updateFile({
    path: "/index.ts",
    code: currentDoc,
  });

  const answer = await worker.getAutocompletion({
    path: "/index.ts",
    context: {
      pos: editorContext.pos,
      explicit: editorContext.explicit,
    },
  });

  console.log("DG: completions", answer);
  return answer;
};

export function draftPluginForCompletions() {
  console.log("DG: Asked for third rough plugin");
  return autocompletion({
    activateOnTyping: true,
    override: [createCompletionOverride],
  });
}

/* CODE BELOW THIS IS JUST AI BOILERPLATE, HASN'T BEEN TESTED / VERIFIED */

export function draftPluginForLinting() {
  return linter(async (view) => {
    const worker = await provider.getWorker();
    const code = view.state.doc.toString();
    await worker.updateFile({ path: "/index.ts", code });
    const diagnostics: Diagnostic[] = await worker.getLints({
      path: "/index.ts",
      diagnosticCodesToIgnore: [],
    });
    return diagnostics;
  });
}

export function draftPluginForHovering() {
  return hoverTooltip(
    async (view, pos): Promise<Tooltip | null> => {
      const worker = await provider.getWorker();
      const code = view.state.doc.toString();
      await worker.updateFile({ path: "/index.ts", code });
      const hoverInfo = await worker.getHover({ path: "/index.ts", pos });
      if (!hoverInfo?.quickInfo) return null;

      const display = hoverInfo.quickInfo.displayParts?.map((p) => p.text).join("") ?? "";
      const documentation = hoverInfo.quickInfo.documentation?.map((p) => p.text).join("") ?? "";
      const tags = (hoverInfo.quickInfo.tags ?? [])
        .map((tag) => {
          const name = tag.name;
          const text = tag.text?.map((t) => t.text).join("") ?? "";
          return `@${name} ${text}`;
        })
        .join("\n");

      const dom = document.createElement("div");

      dom.innerHTML = `
        <div class="tooltip-signature"><code>${display}</code></div>
        ${documentation ? `<div class="tooltip-doc">${documentation}</div>` : ""}
        ${tags ? `<pre class="tooltip-tags">${tags}</pre>` : ""}
      `;

      dom.className = "some-tooltip";
      return {
        pos: hoverInfo.start,
        end: hoverInfo.end,
        create() {
          return { dom };
        },
      };
    }
  );
}

const allDraftExtensions = [draftPluginForCompletions(), draftPluginForHovering(), draftPluginForLinting()];

export default allDraftExtensions;
