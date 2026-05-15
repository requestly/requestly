export const getApiClientCollectionPath = (apiClientRootPath, collectionId) => {
  const normalizedRootPath = (apiClientRootPath || "/api-client").replace(/\/+$/, "") || "/";
  const collectionPathPrefix = normalizedRootPath === "/" ? "/collection" : `${normalizedRootPath}/collection`;

  return `${collectionPathPrefix}/${encodeURIComponent(collectionId)}`;
};

export const buildParentCollectionBreadcrumbs = (ancestorRecords, apiClientRootPath) => {
  return (ancestorRecords ?? [])
    .slice()
    .reverse()
    .filter((record) => record?.id !== undefined && record?.id !== null && record.id !== "")
    .map((record) => ({
      label: record?.name || "Untitled collection",
      pathname: getApiClientCollectionPath(apiClientRootPath, record.id),
      isEditable: false,
    }));
};
