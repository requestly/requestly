import { describe, it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { zipWorkspaceExport, WORKSPACE_ZIP_FILENAMES } from "./zipWorkspaceExport";

describe("zipWorkspaceExport", () => {
  const payload = {
    collectionsJson: { schema_version: "1.0.0", records: [{ id: "c1" }] },
    environmentsJson: {
      schema_version: "1.0.0",
      environments: [{ id: "e1", isGlobal: false, name: "Dev", variables: {} }],
    },
    counts: { collections: 1, apis: 0, environments: 1 },
  } as any;

  it("returns a Uint8Array containing both files", () => {
    const bytes = zipWorkspaceExport(payload);

    expect(bytes).toBeInstanceOf(Uint8Array);

    const unzipped = unzipSync(bytes);
    expect(Object.keys(unzipped).sort()).toEqual(["collections.json", "environments.json"]);
  });

  it("produces valid JSON with the correct shape and schema_version", () => {
    const unzipped = unzipSync(zipWorkspaceExport(payload));

    const collections = JSON.parse(strFromU8(unzipped[WORKSPACE_ZIP_FILENAMES.collections]!));
    const environments = JSON.parse(strFromU8(unzipped[WORKSPACE_ZIP_FILENAMES.environments]!));

    expect(collections.schema_version).toBe("1.0.0");
    expect(collections.records).toEqual([{ id: "c1" }]);
    expect(environments.schema_version).toBe("1.0.0");
    expect(environments.environments).toHaveLength(1);
  });
});
