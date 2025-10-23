import { displayFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";

// type SelectedFile = {
//   name: string;
//   path: string;
//   size: number;
// };

export const useFileSelection = () => {
  const openFileSelector = (success: (file: { name: string; path: string; size: number }) => void) => {
    displayFileSelector(
      (file: { name: string; path: string; size: number }) => {
        success(file);
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
