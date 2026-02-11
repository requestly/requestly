import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";
import {
  trackCollectionRunnerFileParsed,
  trackCollectionRunnerFileParseFailed,
} from "modules/analytics/events/features/apiClient";
import { parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { ITERATIONS_MAX_LIMIT } from "features/apiClient/slices/runConfig/constants";

export enum DataFileModalViewMode {
  LOADING = "loading",
  PREVIEW = "preview",
  ACTIVE = "active",
  ERROR = "error",
  LARGE_FILE = "largeFile",
}

interface DataFileModalContextType {
  viewMode: DataFileModalViewMode;
  parsedData: { data: Record<string, any>[]; count: number } | null;
  dataFileMetadata: { name: string; path: string; size: number } | null;
  setViewMode: (mode: DataFileModalViewMode) => void;
  setParsedData: (data: { data: Record<string, any>[]; count: number } | null) => void;
  setDataFileMetadata: (metadata: { name: string; path: string; size: number } | null) => void;
  parseFile: (filePath: string, isPreviewMode: boolean) => Promise<void>;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const DataFileModalContext = createContext<DataFileModalContextType | undefined>(undefined);

export const useDataFileModalContext = () => {
  const context = useContext(DataFileModalContext);
  if (!context) {
    throw new Error("useDataFileModalContext must be used within DataFileModalProvider");
  }
  return context;
};

interface DataFileModalProviderProps {
  children: ReactNode;
}

export const DataFileModalProvider: React.FC<DataFileModalProviderProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<DataFileModalViewMode>(DataFileModalViewMode.LOADING);
  const [parsedData, setParsedData] = useState<{ data: Record<string, any>[]; count: number } | null>(null);
  const [dataFileMetadata, setDataFileMetadata] = useState<{ name: string; path: string; size: number } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const parseFile = useCallback(async (filePath: string, isPreviewMode: boolean) => {
    setViewMode(DataFileModalViewMode.LOADING);
    setParsedData(null);

    try {
      const data = await parseCollectionRunnerDataFile(filePath, ITERATIONS_MAX_LIMIT);
      setParsedData(data);
      setViewMode(isPreviewMode ? DataFileModalViewMode.PREVIEW : DataFileModalViewMode.ACTIVE);
      trackCollectionRunnerFileParsed({ record_count: data.count, format: getFileExtension(filePath).slice(1) });
    } catch (error) {
      setViewMode(DataFileModalViewMode.ERROR);
      trackCollectionRunnerFileParseFailed({ reason: error.message, format: getFileExtension(filePath).slice(1) });
    }
  }, []);

  const value: DataFileModalContextType = {
    viewMode,
    parsedData,
    dataFileMetadata,
    setViewMode,
    setParsedData,
    setDataFileMetadata,
    parseFile,
    showModal,
    setShowModal,
  };

  return <DataFileModalContext.Provider value={value}>{children}</DataFileModalContext.Provider>;
};
