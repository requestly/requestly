import { EntityId, TreeIndices } from "../slices/types";

export function getParentChain(id: EntityId, childToParent: Record<EntityId, EntityId | null>): EntityId[] {
  const result: EntityId[] = [];

  const traverse = (currentId: EntityId) => {
    const parent = childToParent[currentId];
    if (parent) {
      result.push(parent);
      traverse(parent);
    }
  };

  traverse(id);
  return result;
}

export function getAllDescendants(id: EntityId, parentToChildren: Record<EntityId, EntityId[]>): EntityId[] {
  const result: EntityId[] = [];

  const traverse = (currentId: EntityId) => {
    const children = parentToChildren[currentId] || [];
    result.push(...children);
    children.forEach(traverse);
  };

  traverse(id);
  return result;
}

export function getImmediateChildren(id: EntityId, parentToChildren: Record<EntityId, EntityId[]>): EntityId[] {
  return parentToChildren[id] || [];
}

export function buildTreeIndices<T extends { id: EntityId; collectionId: EntityId | null }>(records: T[]): TreeIndices {
  const childToParent: Record<EntityId, EntityId | null> = {};
  const parentToChildren: Record<EntityId, EntityId[]> = {};
  const rootIds: EntityId[] = [];

  for (const record of records) {
    childToParent[record.id] = record.collectionId;

    if (record.collectionId) {
      if (!parentToChildren[record.collectionId]) {
        parentToChildren[record.collectionId] = [];
      }
      parentToChildren[record.collectionId].push(record.id);
    } else {
      rootIds.push(record.id);
    }
  }

  return { childToParent, parentToChildren, rootIds };
}
