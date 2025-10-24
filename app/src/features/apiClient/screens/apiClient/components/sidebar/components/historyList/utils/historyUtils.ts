import dayjs from 'dayjs';
import { RQAPI } from 'features/apiClient/types';

export interface GroupedHistory {
  dateLabel: string;
  date: string;
  entries: RQAPI.ApiEntry[];
  indices: number[]; 
}


export const groupHistoryByDate = (history: RQAPI.ApiEntry[]): GroupedHistory[] => {
  if (history.length === 0) return [];


  return [
    {
      dateLabel: 'Recent',
      date: dayjs().format('YYYY-MM-DD'),
      entries: history,
      indices: history.map((_, index) => index)
    }
  ];
};


export const groupHistoryByDateWithRecords = (
  history: RQAPI.ApiEntry[],
  records?: RQAPI.ApiRecord[]
): GroupedHistory[] => {
  const today = dayjs().startOf('day');
  const yesterday = dayjs().subtract(1, 'day').startOf('day');

  if (!records || records.length !== history.length) {
    
    return groupHistoryByDate(history);
  }


  const grouped: { [key: string]: { entries: RQAPI.ApiEntry[]; indices: number[] } } = {};

  history.forEach((entry, index) => {
    const record = records[index];
    const entryDate = dayjs(record.createdTs).startOf('day');
    const dateKey = entryDate.format('YYYY-MM-DD');

    if (!grouped[dateKey]) {
      grouped[dateKey] = { entries: [], indices: [] };
    }
    grouped[dateKey].entries.push(entry);
    grouped[dateKey].indices.push(index);
  });


  const result: GroupedHistory[] = Object.keys(grouped)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
    .map(dateKey => {
      const date = dayjs(dateKey);
      let dateLabel: string;

      if (date.isSame(today, 'day')) {
        dateLabel = 'Today';
      } else if (date.isSame(yesterday, 'day')) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = date.format('MMM DD, YYYY');
      }

      return {
        dateLabel,
        date: dateKey,
        entries: grouped[dateKey].entries,
        indices: grouped[dateKey].indices
      };
    });

  return result;
};

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