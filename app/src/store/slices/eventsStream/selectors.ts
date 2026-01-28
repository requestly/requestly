import { EntityState } from "@reduxjs/toolkit";
import { APIClientEvent } from "features/apiClient/eventStream/types";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { eventsAdapter } from "./slice";

export const getEvents = () => (state: RootState): EntityState<APIClientEvent> => {
  return state[ReducerKeys.EVENTS].events;
};

const sliceRootState = (state: RootState) => state[ReducerKeys.EVENTS];

const eventsEntitySelectors = eventsAdapter.getSelectors((state: RootState) => sliceRootState(state)["events"]);

export const getAllEvents = (state: RootState) => eventsEntitySelectors.selectAll(state);

export const getEventByRecordAndIt = (rid?: string, iteration?: number) => (state: RootState) => {
  const all = getAllEvents(state) as APIClientEvent[];
  return all.filter((w) => w.tag.recordId === rid && w.tag.iteration === iteration);
};
