import { describe, it, expect } from "vitest";
import { sanitizeRecord, sanitizeRecords, sanitizeEnvironments } from "./sanitize";
import { RQAPI } from "features/apiClient/types";

describe("sanitizeRecord", () => {
  it("strips createdBy, updatedBy, ownerId, createdTs, updatedTs", () => {
    const record = {
      id: "r1",
      name: "Hello",
      type: RQAPI.RecordType.API,
      collectionId: "c1",
      createdBy: "user-1",
      updatedBy: "user-1",
      ownerId: "user-1",
      createdTs: 123,
      updatedTs: 456,
      data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } },
    } as any;

    const result = sanitizeRecord(record);

    expect(result).not.toHaveProperty("createdBy");
    expect(result).not.toHaveProperty("updatedBy");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("createdTs");
    expect(result).not.toHaveProperty("updatedTs");
    expect(result.id).toBe("r1");
  });

  it("does not strip data.examples from API records", () => {
    const record = {
      id: "r1",
      type: RQAPI.RecordType.API,
      collectionId: "c1",
      createdBy: "user-1",
      data: {
        request: {},
        response: null,
        auth: { currentAuthType: "NO_AUTH" },
        examples: [{ id: "ex1", type: RQAPI.RecordType.EXAMPLE_API, parentRequestId: "r1", data: {} }],
      },
    } as any;

    const result = sanitizeRecord(record) as any;

    expect(result.data.examples).toHaveLength(1);
    expect(result.data.examples[0].id).toBe("ex1");
  });
});

describe("sanitizeRecords", () => {
  it("flattens a nested collection tree into a single array, preserving order", () => {
    const tree = {
      id: "col1",
      type: RQAPI.RecordType.COLLECTION,
      collectionId: null,
      name: "Root",
      data: {
        auth: { currentAuthType: "NO_AUTH" },
        variables: {},
        children: [
          {
            id: "api1",
            type: RQAPI.RecordType.API,
            collectionId: "col1",
            data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } },
          },
          {
            id: "col2",
            type: RQAPI.RecordType.COLLECTION,
            collectionId: "col1",
            data: {
              auth: { currentAuthType: "NO_AUTH" },
              variables: {},
              children: [
                {
                  id: "api2",
                  type: RQAPI.RecordType.API,
                  collectionId: "col2",
                  data: { request: {}, response: null, auth: { currentAuthType: "NO_AUTH" } },
                },
              ],
            },
          },
        ],
      },
    } as any;

    const result = sanitizeRecords(tree);
    const ids = result.map((r: any) => r.id);

    expect(ids).toEqual(["col1", "api1", "col2", "api2"]);
  });

  it("strips children from the emitted collection node", () => {
    const tree = {
      id: "col1",
      type: RQAPI.RecordType.COLLECTION,
      collectionId: null,
      data: { auth: { currentAuthType: "NO_AUTH" }, variables: {}, children: [] },
    } as any;

    const result = sanitizeRecords(tree);

    expect((result[0] as any).data).not.toHaveProperty("children");
  });
});

describe("sanitizeEnvironments", () => {
  it("strips localValue from every variable and tags isGlobal correctly", () => {
    const envs = [
      {
        id: "env1",
        name: "Local",
        variables: {
          API_KEY: { syncValue: "s", localValue: "l", type: "string" },
        },
      },
      {
        id: "global",
        name: "Global",
        variables: {
          HOST: { syncValue: "api.example.com", localValue: "api.local", type: "string" },
        },
      },
    ] as any;

    const result = sanitizeEnvironments(envs);

    expect(result[0].variables.API_KEY).not.toHaveProperty("localValue");
    expect(result[0].variables.API_KEY).toHaveProperty("syncValue", "s");
    expect(result[0].isGlobal).toBe(false);
    expect(result[1].isGlobal).toBe(true);
    expect(result[1].variables.HOST).not.toHaveProperty("localValue");
  });
});
