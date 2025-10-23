import { displayFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { useRunConfigStore } from "../../../run.context";
import { FileFeature } from "features/apiClient/store/apiClientFilesStore";

export const useFileSelection = () => {
  const [setDataFile] = useRunConfigStore((s) => [s.setDataFile]);
  const handleFileSelection = (
    file: { name: string; path: string; size: number },
    success: (file: { name: string; path: string; size: number }) => void
  ) => {
    if (file.size >= 100 * 1024 * 1024) {
      success(file);
      return;
    }
    const fileId = file.name + "-" + Date.now();

    setDataFile({
      id: fileId,
      name: file.name,
      path: file.path,
      size: file.size,
      source: "desktop",
      fileFeature: FileFeature.COLLECTION_RUNNER,
    });

    success(file);
  };

  const openFileSelector = (success: (file: { name: string; path: string; size: number }) => void) => {
    displayFileSelector(
      (file: { name: string; path: string; size: number }) => {
        handleFileSelection(file, success);
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
