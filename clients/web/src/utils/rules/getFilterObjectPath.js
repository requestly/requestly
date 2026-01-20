export const getFilterObjectPath = (objectPath, filterIndex = 0) => {
  if (!objectPath.includes("filters")) {
    return objectPath;
  }
  const splitObjectPath = objectPath.split(".");
  splitObjectPath[1] = splitObjectPath[1] + `[${filterIndex}]`;
  return splitObjectPath.join(".");
};
