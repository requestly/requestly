import { createWorker } from "@valtown/codemirror-ts/worker";
import RQNameSpaceContents from "./namespace.ts?raw";
import { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import ts from "typescript";
import * as Comlink from "comlink";

const files = [
  { "/rq-namespace.ts": RQNameSpaceContents },
  {
    "/global.d.ts": /* the import seems unnecessary but is required to make this file be treated as a module*/ `
    import type { rq as _rq } from "./rq-namespace"; 
    declare global { const rq: typeof import("./rq-namespace").rq; }
`,
  },
  { "/index.ts": `/* will be replaced by editor contents */` },
];

const worker = createWorker(async function () {
  const fsMap = await createDefaultMapFromCDN({ target: ts.ScriptTarget.ES2022 }, "5.7.3", false, ts);
  files.forEach((file) => {
    const [filePath, content] = Object.entries(file)[0];
    fsMap.set(filePath, content);
  });
  const system = createSystem(fsMap);
  const compilerOpts = {};
  return createVirtualTypeScriptEnvironment(
    system,
    ["/rq-namespace.ts", "/global.d.ts", "/index.ts"],
    ts,
    compilerOpts
  );
});

Comlink.expose(worker);
