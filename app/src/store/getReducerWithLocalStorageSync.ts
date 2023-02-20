import { Reducer } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { getPersistConfig } from "redux-deep-persist";
import storage from "redux-persist/lib/storage";

const getReducerWithLocalStorageSync = (
  key: string,
  reducer: Reducer,
  whitelist: string[]
): Reducer => {
  const persistConfig = getPersistConfig({
    storage, // default localstorage
    key,
    rootReducer: reducer,
    whitelist,
  });

  return persistReducer(persistConfig, reducer);
};

export default getReducerWithLocalStorageSync;
