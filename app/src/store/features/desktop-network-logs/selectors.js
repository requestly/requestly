import { ReducerKeys } from "store/constants";

export const getDesktopReduxSlice = (state) => {
  return state[ReducerKeys.DESKTOP_TRAFFIC];
};

export const getPaginatedLogs = (state, page) => {
  // todo: add pagination here
  console.log("Requested page", page);
  return getDesktopReduxSlice(state).logs;
};

export const getDesktopLogs = (state) => {
  return getDesktopReduxSlice(state).logs;
};

// export const getSortedDesktopLogs = (state) => {
//   const logs = getDesktopLogs(state)

//     const logs = Object.values(networkLogsMap).sort(
//       (log1, log2) => log2.timestamp - log1.timestamp
//     );

//     if (searchKeyword) {
//       const reg = new RegExp(searchKeyword, "i");
//       const filteredLogs = logs.filter((log) => {
//         return log.url.match(reg);
//       });

//       return filteredLogs;
//     }
//     return logs;
// }
