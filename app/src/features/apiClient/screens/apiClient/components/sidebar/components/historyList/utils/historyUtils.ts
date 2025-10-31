import dayjs from 'dayjs';
import type { HistoryEntry } from "features/apiClient/screens/apiClient/historyStore";
import { getDateKeyFromTimestamp } from "features/apiClient/screens/apiClient/historyStore";
export interface GroupedHistory {
  dateLabel: string;
  date: string;
  entries: HistoryEntry[];
  indices: number[]; 
}


export const groupHistoryByDate = (history: HistoryEntry[]): GroupedHistory[] => {
  if (history.length === 0) return [];

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayKey = getDateKeyFromTimestamp(today.getTime());
  const yesterdayKey = getDateKeyFromTimestamp(yesterday.getTime());

  const grouped: Record<string, GroupedHistory> = {};

  history.forEach((entry, index) => {
    const dateKey = getDateKeyFromTimestamp(entry.createdTs);
    let dateLabel: string;
    if (dateKey === todayKey) {
      dateLabel = "Today";
    } else if (dateKey === yesterdayKey) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = new Date(entry.createdTs).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (!grouped[dateKey]) {
      grouped[dateKey] = { dateLabel, date: dateKey, entries: [], indices: [] };
    }
    grouped[dateKey].entries.push(entry);
    grouped[dateKey].indices.push(index);
  });

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
};
;

// ----------------DEAD CODE ALERT!! ---------------//
// export const groupHistoryByDateWithRecords = (
//   history: HistoryEntry[],
//   records?: RQAPI.ApiRecord[]
// ): GroupedHistory[] => {
//   const today = dayjs().startOf('day');
//   const yesterday = dayjs().subtract(1, 'day').startOf('day');

//   if (!records || records.length !== history.length) {
    
//     return groupHistoryByDate(history);
//   }


//   const grouped: { [key: string]: { entries: RQAPI.ApiEntry[]; indices: number[] } } = {};

//   history.forEach((entry, index) => {
//     const record = records[index];
//     const entryDate = dayjs(record.createdTs).startOf('day');
//     const dateKey = entryDate.format('YYYY-MM-DD');

//     if (!grouped[dateKey]) {
//       grouped[dateKey] = { entries: [], indices: [] };
//     }
//     grouped[dateKey].entries.push(entry);
//     grouped[dateKey].indices.push(index);
//   });


//   const result: GroupedHistory[] = Object.keys(grouped)
//     .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
//     .map(dateKey => {
//       const date = dayjs(dateKey);
//       let dateLabel: string;

//       if (date.isSame(today, 'day')) {
//         dateLabel = 'Today';
//       } else if (date.isSame(yesterday, 'day')) {
//         dateLabel = 'Yesterday';
//       } else {
//         dateLabel = date.format('MMM DD, YYYY');
//       }

//       return {
//         dateLabel,
//         date: dateKey,
//         entries: grouped[dateKey].entries,
//         indices: grouped[dateKey].indices
//       };
//     });

//   return result;
// };

export const formatRelativeTime = (timestamp?: number): string => {
  if (!timestamp) return '';
  return dayjs(timestamp).format('h:mm A');
};

export interface DeleteModalConfig {
  visible: boolean;
  type: 'single' | 'date' | null;
  dateLabel?: string;
  itemIndex?: number;
}

export const getDeleteConfirmationMessage = (type: 'single' | 'date', dateLabel?: string): string => {
  if (type === 'single') {
    return 'Are you sure you want to delete this history item? This action cannot be undone.';
  }
  return `Are you sure you want to delete all history items for "${dateLabel}"? This action cannot be undone.`;
};
