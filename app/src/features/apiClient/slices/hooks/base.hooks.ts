import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { ApiClientRootState } from "./types";

export const useApiClientSelector: TypedUseSelectorHook<ApiClientRootState> = useSelector;

export const useApiClientDispatch = () => useDispatch<Dispatch>();
