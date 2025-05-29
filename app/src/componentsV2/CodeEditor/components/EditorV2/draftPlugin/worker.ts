import { createWorker } from "@valtown/codemirror-ts/worker";
import RQNameSpaceContents from "./namespace.ts?raw";
import { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import ts from "typescript";
import * as Comlink from "comlink";

const files = [{ "/rq-namespace.ts": RQNameSpaceContents }, { "/index.ts": `import { rq } from './rq-namespace';` }];

const worker = createWorker(async function () {
  const fsMap = await createDefaultMapFromCDN({ target: ts.ScriptTarget.ES2022 }, "5.7.3", false, ts);
  files.forEach((file) => {
    const [filePath, content] = Object.entries(file)[0];
    fsMap.set(filePath, content);
  });
  const system = createSystem(fsMap);
  const compilerOpts = {};
  console.log("DG: Creating virtual TypeScript environment with files", files);
  return createVirtualTypeScriptEnvironment(system, ["/rq-namespace.ts"], ts, compilerOpts);
});

Comlink.expose(worker);
