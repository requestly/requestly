import type { TypedUseSelectorHook } from "react-redux";
import type { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { useWorkspaceViewDispatch, useWorkspaceViewSelector } from "features/apiClient/common/WorkspaceProvider";

export const useApiClientSelector: TypedUseSelectorHook<ApiClientStoreState> = useWorkspaceViewSelector;

export type ApiClientThunkDispatch = ThunkDispatch<ApiClientStoreState, unknown, AnyAction>;

export const useApiClientDispatch = () => useWorkspaceViewDispatch<ApiClientThunkDispatch>();
