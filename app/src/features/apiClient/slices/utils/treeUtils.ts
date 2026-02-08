import { EntityId, TreeIndices } from "../types";

/**
 * Returns the chain of parent IDs from the given ID up to the root.
 * The first element is the immediate parent, last is the root ancestor.
 */
export function getParentChain(id: EntityId, childToParent: Record<EntityId, EntityId | null>): EntityId[] {
  const result: EntityId[] = [];

  const traverse = (currentId: EntityId): void => {
    const parent = childToParent[currentId];
    // Use != null to handle both null and undefined, and avoid issues with falsy IDs
    if (parent != null) {
      result.push(parent);
      traverse(parent);
    }
  };

  traverse(id);
  return result;
}

/**
 * Returns all descendant IDs (children, grandchildren, etc.) of the given ID.
 */
export function getAllDescendants(id: EntityId, parentToChildren: Record<EntityId, EntityId[]>): EntityId[] {
  const result: EntityId[] = [];

  const traverse = (currentId: EntityId): void => {
    const children = parentToChildren[currentId] ?? [];
    result.push(...children);
    children.forEach(traverse);
  };

  traverse(id);
  return result;
}

/**
 * Returns the immediate children IDs of the given ID.
 */
export function getImmediateChildren(id: EntityId, parentToChildren: Record<EntityId, EntityId[]>): EntityId[] {
  return parentToChildren[id] ?? [];
}

/**
 * Builds tree indices from a flat array of records.
 * Creates efficient O(1) lookups for parent-child relationships.
 */
export function buildTreeIndices<T extends { id: EntityId; collectionId: EntityId | null }>(records: T[]): TreeIndices {
  const childToParent: Record<EntityId, EntityId | null> = {};
  const parentToChildren: Record<EntityId, EntityId[]> = {};
  const rootIds: EntityId[] = [];

  for (const record of records) {
    childToParent[record.id] = record.collectionId;

    // Use != null to handle both null and undefined
    if (record.collectionId != null) {
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
