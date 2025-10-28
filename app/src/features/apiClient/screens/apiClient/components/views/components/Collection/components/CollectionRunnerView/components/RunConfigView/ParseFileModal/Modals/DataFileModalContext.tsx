import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";

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

  const parseFile = useCallback(async (filePath: string, isPreviewMode: boolean) => {
    setViewMode(DataFileModalViewMode.LOADING);
    setParsedData(null);

    try {
      const data = await parseCollectionRunnerDataFile(filePath, ITERATIONS_MAX_LIMIT);
      setParsedData(data);
      setViewMode(isPreviewMode ? DataFileModalViewMode.PREVIEW : DataFileModalViewMode.ACTIVE);
    } catch (error) {
      setViewMode(DataFileModalViewMode.ERROR);
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
  };

  return <DataFileModalContext.Provider value={value}>{children}</DataFileModalContext.Provider>;
};
