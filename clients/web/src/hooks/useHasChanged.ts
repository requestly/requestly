import { usePrevious } from "./usePrevious";

export const useHasChanged = <T>(value: T): boolean => {
  const previousValue = usePrevious<T>(value);
  return previousValue !== value;
};
