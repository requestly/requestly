export type EntityId = string;

export type EntityType = "request" | "collection";

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type DeepPartialWithNull<T> = T extends object ? { [P in keyof T]?: DeepPartialWithNull<T[P]> | null } : T;

export type DeleteMarker<T> = T extends object ? { [P in keyof T]?: DeleteMarker<T[P]> | true } : true;

export type UpdateCommand<T = unknown> =
  | { readonly type: "SET"; readonly value: DeepPartialWithNull<T> }
  | { readonly type: "DELETE"; readonly value: DeleteMarker<T> };

export interface TreeIndices {
  childToParent: Record<EntityId, EntityId | null>;
  parentToChildren: Record<EntityId, EntityId[]>;
  rootIds: EntityId[];
}

export interface BufferWrapper<T = unknown> {
  readonly id: EntityId;
  readonly entityType: EntityType;
  readonly original: T;
  data: T;
  diff: DeepPartial<T>;
  isDirty: boolean;
}
