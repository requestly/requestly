import { createContext, useContext } from "react";

export const GenericStateContext = createContext<Record<string, any>>({});

export const useGenericState = () => {
  return useContext(GenericStateContext);
};
