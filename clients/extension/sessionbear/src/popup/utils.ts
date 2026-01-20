export const isExtensionManifestV3 = (): boolean => {
  return chrome.runtime.getManifest()["manifest_version"] === 3;
};

export const updateItemInCollection = <T extends { id: string }>(collection: T[], updatedItem: T): T[] => {
  return collection.map((item) => (item.id === updatedItem.id ? updatedItem : item));
};
