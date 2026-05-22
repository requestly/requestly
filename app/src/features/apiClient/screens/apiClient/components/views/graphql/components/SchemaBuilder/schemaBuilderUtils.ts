import { parse } from "graphql";

export const getExplorerQuery = (operation: string) => {
  try {
    parse(operation);
    return operation;
  } catch (e) {
    return "";
  }
};
