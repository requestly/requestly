import { useSelector } from "react-redux";
import { ReducerKeys } from "store/constants";
// import { APIClientEvent, eventsSlice } from ".eslice";
import { RootState } from "store/types";
import { createDraftSafeSelector, EntityState } from "@reduxjs/toolkit";
import { APIClientEvent, eventsAdapter, EventsSliceState } from "./slice";

export const getEvents = () => (state: RootState): EntityState<APIClientEvent> => {
    return state[ReducerKeys.EVENTS].events;
};

const sliceRootState = (state: RootState) => state[ReducerKeys.EVENTS];

const eventsEntitySelectors = eventsAdapter.getSelectors(
  (state: RootState) => sliceRootState(state)["events"]
);


export const getAllEvents = (state: RootState) => eventsEntitySelectors.selectAll(state);

export const getEventByRecordAndIt = (rid?: string, iteration?:number) => (state: RootState) =>{
     const all = getAllEvents(state) as APIClientEvent[];
      return all.filter((w) => w.tag.recordId === rid && w.tag.iteration === iteration);
}
 

// export const getNonLocalWorkspaces = (state: RootState) => {

// };


// export const getEventsByIteration =
//   (recordId:string, iteration:number) =>
//   (state: RootState): EntityState<APIClientEvent> => {
//     return eventsAdapter.getSelectors().selectAll(state)

//     })
//   };

// export const getEventsForExecution = (state: RootState, recordId: string, iteration: number) => createDraftSafeSelector(
//   [
//     (state: EventsSliceState) => eventsAdapter.getSelectors().selectAll(state.events),
//     (_state: EventsSliceState, rId: string) => rId,
//     (_state: EventsSliceState, iteration: number) => iteration,
//   ],
//   (allEvents, rId, iteration) => {
//     // if (!executionId) return [];

//     return allEvents.filter((event) => event.tags.recordId === rId && event.tags.iteration === iteration);
//   }
// )(state[ReducerKeys.EVENTS], recordId, iteration);