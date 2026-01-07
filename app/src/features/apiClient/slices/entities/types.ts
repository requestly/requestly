import type { Dispatch } from "@reduxjs/toolkit";
import type { DeepPartial, DeepPartialWithNull } from "../types";

export enum ApiClientEntityType {
  HTTP_RECORD = "http_record",
  COLLECTION_RECORD = "collection_record",
  GRAPHQL_RECORD = "graphql_record",
  ENVIRONMENT = "environment",
  GLOBAL_ENVIRONMENT = "global",
  RUNTIME_VARIABLES = "runtime_variables",
  RUN_CONFIG = "run_config",
}

export type { DeepPartial, DeepPartialWithNull };

export type EntityDispatch = Dispatch;
