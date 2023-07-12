import { useState } from "react";

const STORE_PROPERTY = "rq-devtools";

const getFromStore = (key: string): string => {
  try {
    const store = JSON.parse(window.localStorage.getItem(STORE_PROPERTY) || "{}");
    return store[key];
  } catch (e) {
    return undefined;
  }
};

const saveToStore = (key: string, value: string): void => {
  try {
    let store = JSON.parse(window.localStorage.getItem(STORE_PROPERTY) || "{}");
    store = { ...store, [key]: value };
    window.localStorage.setItem(STORE_PROPERTY, JSON.stringify(store));
  } catch (e) {}
};

type SetValueAndSaveAction = (val: string) => void;

const useLocalStorageState = <T>(key: string, initialValue: T): [T, SetValueAndSaveAction] => {
  const valueFromStore = getFromStore(key);
  const [value, setValue] = useState(typeof valueFromStore === "undefined" ? initialValue : valueFromStore);

  const setValueAndSave: SetValueAndSaveAction = (val) => {
    setValue(val);
    saveToStore(key, val);
  };

  return [value as T, setValueAndSave];
};

export default useLocalStorageState;
