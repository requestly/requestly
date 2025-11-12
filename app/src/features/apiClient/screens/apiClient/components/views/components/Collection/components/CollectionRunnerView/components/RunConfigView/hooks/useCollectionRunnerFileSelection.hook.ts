import { displayFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { DataFileModalViewMode, useDataFileModalContext } from "../ParseFileModal/Modals/DataFileModalContext";
import { LARGE_FILE_SIZE } from "features/apiClient/constants";

export const useCollectionRunnerFileSelection = () => {
  const { setDataFileMetadata, setShowModal, setViewMode, parseFile } = useDataFileModalContext();
  const openFileSelector = (onsuccess?: (file: { name: string; path: string; size: number }) => void) => {
    displayFileSelector(
      (file: { name: string; path: string; size: number }) => {
        const metadata = {
          name: file.name,
          path: file.path,
          size: file.size,
        };

        setDataFileMetadata(metadata);

        if (file.size > LARGE_FILE_SIZE) {
          setViewMode(DataFileModalViewMode.LARGE_FILE);
          setShowModal(true);
          return;
        }
        setShowModal(true);
        parseFile(file.path, true);

        onsuccess?.(file);
      },
      {
        filters: [{ name: "File formats allowed", extensions: ["json", "csv"] }],
      }
    );
  };

  return {
    openFileSelector,
  };
};
