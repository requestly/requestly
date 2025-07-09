import { useCallback, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";

export const useHasUnsavedChanges = <T>(currentValue: T, reset = false) => {
  const originalValue = useRef<T>(currentValue);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unloadListener = (e: any) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", unloadListener);
    }

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setHasUnsavedChanges(!isEqual(originalValue.current, currentValue));
  }, [currentValue]);

  const resetChanges = useCallback(
    (resetValue?: T) => {
      originalValue.current = resetValue ?? currentValue;
      setHasUnsavedChanges(false);
    },
    [currentValue]
  );

  useEffect(() => {
    if (!reset) {
      return;
    }

    resetChanges();
  }, [reset, resetChanges]);

  return { hasUnsavedChanges, resetChanges };
};
