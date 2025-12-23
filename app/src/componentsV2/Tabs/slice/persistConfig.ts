import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { tabsReducer } from "./slice";
import { tabsPersistTransform } from "./persistTransform";

const STORAGE_KEY = "rq_tabs_store";

const tabsPersistConfig = {
  key: STORAGE_KEY,
  storage,
  throttle: 1000,
  transforms: [tabsPersistTransform],
};

export const tabsReducerWithPersist = persistReducer(tabsPersistConfig, tabsReducer);
