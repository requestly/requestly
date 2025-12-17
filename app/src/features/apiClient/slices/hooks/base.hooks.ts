import { TypedUseSelectorHook } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { useWorkspaceViewDispatch, useWorkspaceViewSelector } from "features/apiClient/common/WorkspaceProvider";

export const useApiClientSelector: TypedUseSelectorHook<ApiClientStoreState> = useWorkspaceViewSelector;

export const useApiClientDispatch = () => useWorkspaceViewDispatch<Dispatch>();
