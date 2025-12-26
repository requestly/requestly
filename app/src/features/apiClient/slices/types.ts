import { NativeError } from "../../../errors/NativeError";

export type EntityId = string;

export type EntityType = "request" | "collection";

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type DeepPartialWithNull<T> = T extends object
  ? { [P in keyof T]?: DeepPartialWithNull<T[P]> | null }
  : T | null;

export type UpdateCommand<T = unknown> =
  | { readonly type: "SET"; readonly value: DeepPartial<T> }
  | { readonly type: "DELETE"; readonly value: DeepPartialWithNull<T> };

export interface TreeIndices {
  childToParent: Record<EntityId, EntityId | null>;
  parentToChildren: Record<EntityId, EntityId[]>;
  rootIds: EntityId[];
}


export class EntityNotFound extends NativeError {
  constructor(readonly id: string, type: any) {
    super(`Could not find entity ${id} of type ${type} in store!`);
    this.addContext({
      id,
      type
    });
  }
}


export class InvalidEntityShape extends NativeError {
  constructor(params: {id: string, expectedType: any, foundType: any}) {
    const { id, expectedType, foundType } = params;
    super(`Entity ${id} of type ${foundType} was expected to be of type ${expectedType}`);
    this.addContext({
      id,
      foundType,
      expectedType,
    });
  }
}

