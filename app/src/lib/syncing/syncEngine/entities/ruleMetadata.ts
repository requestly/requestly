import { RxJsonSchema } from "rxdb";
import { RuleMetadataSyncEntity } from "@requestly/shared/types/syncEntities/rules";

export const ruleMetadataSchema: RxJsonSchema<RuleMetadataSyncEntity> = {
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    status: {
      type: "string",
      default: "Inactive",
    },
    isFavourite: {
      type: "boolean",
      default: false,
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
    _deleted: {
      type: "boolean",
    },
  },
  required: ["id"],
};
