import { describe, it, expect } from "vitest";
import { buildWorkspaceExport, WORKSPACE_EXPORT_SCHEMA_VERSION } from "./buildWorkspaceExport";
import { RQAPI } from "features/apiClient/types";

function makeCollection(id: string, children: any[] = []): RQAPI.CollectionRecord {
  return {
    id,
    name: id,
    type: RQAPI.RecordType.COLLECTION,
    collectionId: null,
    data: { auth: { currentAuthType: "NO_AUTH" }, variables: {}, children },
  } as any;
}

function makeApi(id: string, collectionId: string | null, examples: any[] = []): RQAPI.ApiRecord {
  return {
    id,
    name: id,
    type: RQAPI.RecordType.API,
    collectionId,
    data: {
      request: { url: "https://example.com", method: "GET" },
      response: null,
      auth: { currentAuthType: "NO_AUTH" },
      examples,
    },
  } as any;
}

describe("buildWorkspaceExport", () => {
  it("emits schema_version 1.0.0 on both payloads", () => {
    const result = buildWorkspaceExport({ rootRecords: [], environments: [] });

    expect(result.collectionsJson.schema_version).toBe(WORKSPACE_EXPORT_SCHEMA_VERSION);
    expect(result.environmentsJson.schema_version).toBe(WORKSPACE_EXPORT_SCHEMA_VERSION);
    expect(WORKSPACE_EXPORT_SCHEMA_VERSION).toBe("1.0.0");
  });

  it("flattens every collection tree and preserves data.examples on API records", () => {
    const example = { id: "ex1", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "api1", data: {} };
    const api = makeApi("api1", "col1", [example]);
    const collection = makeCollection("col1", [api]);

    const result = buildWorkspaceExport({ rootRecords: [collection], environments: [] });

    const ids = result.collectionsJson.records.map((r: any) => r.id);
    expect(ids).toEqual(["col1", "api1"]);
    const apiRecord = result.collectionsJson.records.find((r: any) => r.id === "api1") as any;
    expect(apiRecord.data.examples).toHaveLength(1);
    expect(apiRecord.data.examples[0].id).toBe("ex1");
  });

  it("handles root-level API records (not inside any collection)", () => {
    const rootApi = makeApi("api1", null);

    const result = buildWorkspaceExport({ rootRecords: [rootApi], environments: [] });

    expect(result.collectionsJson.records.map((r: any) => r.id)).toEqual(["api1"]);
  });

  it("includes every environment and tags the global one with isGlobal: true", () => {
    const envs = [
      { id: "env1", name: "Dev", variables: { K: { syncValue: "v", type: "string" } } },
      { id: "global", name: "Global", variables: {} },
    ] as any;

    const result = buildWorkspaceExport({ rootRecords: [], environments: envs });

    expect(result.environmentsJson.environments).toHaveLength(2);
    expect(result.environmentsJson.environments.find((e: any) => e.id === "global")?.isGlobal).toBe(true);
    expect(result.environmentsJson.environments.find((e: any) => e.id === "env1")?.isGlobal).toBe(false);
  });

  it("returns counts (collections, apis, examples, environments) for UI preview", () => {
    const example1 = { id: "ex1", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "api1", data: {} };
    const example2 = { id: "ex2", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "api0", data: {} };
    const rootApi = makeApi("api0", null, [example2]);
    const nested = makeApi("api1", "col1", [example1]);
    const collection = makeCollection("col1", [nested]);

    const result = buildWorkspaceExport({
      rootRecords: [collection, rootApi],
      environments: [{ id: "env1", name: "Dev", variables: {} }] as any,
    });

    expect(result.counts).toEqual({ collections: 1, apis: 2, examples: 2, environments: 1 });
  });
});
