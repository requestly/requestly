import { RxJsonSchema } from "rxdb";
import { RuleDataSyncEntity } from "@requestly/shared/types/syncEntities/rules";

export const ruleDataSchema: RxJsonSchema<RuleDataSyncEntity> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
    },
    createdBy: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },

    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    objectType: {
      type: "string",
    },

    // TODO: fix this. Don't know why it isn't able to pick this
    // ruleType: {
    //   type: "string",
    // },

    isSample: {
      type: "boolean",
    },
    isReadOnly: {
      type: "boolean",
    },
    _deleted: {
      type: "boolean",
    },

    // Deprecated
    creationDate: {
      type: "number",
    },
    currentOwner: {
      type: "string",
    },
    lastModifiedBy: {
      type: "string",
    },
    modificationDate: {
      type: "number",
    },
  },
  required: ["id", "name"],
};
