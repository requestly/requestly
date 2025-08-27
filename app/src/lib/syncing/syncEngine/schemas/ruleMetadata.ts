import { RxJsonSchema } from "rxdb";
import { RuleMetadataSyncEntity } from "@requestly/shared/types/syncEntities/rules";
import { SyncEntityType } from "@requestly/shared/types/syncEntities";

export const ruleMetadataSchema: RxJsonSchema<RuleMetadataSyncEntity> = {
    version: 1,
    primaryKey: "id",
    type: "object",
    properties: {
        // #region - SyncEntity Properties */
        id: {
            type: "string",
            maxLength: 100,
        },
        workspaceId: {
            type: "string",
        },
        type: {
            type: "string",
            default: SyncEntityType.RULE_METADATA,
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
        data: {
            type: "object", // We can improve to exact entity type. Not needed right now
        },
        _deleted: {
            type: "boolean",
        },
        // #endregion End Properties */
    },
    required: ["id"],
};
