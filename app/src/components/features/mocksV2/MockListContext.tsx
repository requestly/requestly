import { createContext, useContext } from "react";
import { MockType } from "./types";

const MockListContext = createContext({ type: MockType.API });

export const useMockListContext = () => useContext(MockListContext);
export const useMockListType = () => {
  const { type } = useMockListContext();
  return type;
};

export const MockListProvider = MockListContext.Provider;
