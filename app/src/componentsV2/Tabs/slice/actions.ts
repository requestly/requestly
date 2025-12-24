import { ReducerKeys } from "store/constants";
import { TabSource } from "../types";
import { createAction } from "@reduxjs/toolkit";

export const openBufferedTab = createAction<{
  source: TabSource;
  preview?: boolean;
  isNew?: boolean;
}>(`${ReducerKeys.TABS}/openBufferedTab`);
