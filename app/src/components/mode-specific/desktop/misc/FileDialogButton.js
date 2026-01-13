import { Button } from "antd";

export function displayFileSelector(callback, config = {}) {
  //do not mutate incoming config
  const newConfig = { ...config };
  if (newConfig.properties && newConfig.properties.includes("multiSelections")) {
    /*
    This function is meant to select a single file only.
    Hence removing multiSelections property from config.
    Use displayMultiFileSelector for multiple file selection.
    */
    newConfig.properties = newConfig.properties.filter((prop) => prop !== "multiSelections");
  }
  const handleDialogPromise = (result) => {
    //this selector will always have only one single file
    const { canceled, files } = result;
    if (!canceled) {
      if (callback) {
        if (files && files[0]) {
          return callback(files[0]);
        }
      }
    }
  };

  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-file-dialog", newConfig).then((result) => {
      handleDialogPromise(result);
    });
  }
}

export function displayMultiFileSelector(callback, config = {}) {
  const handleDialogPromise = (result) => {
    const { canceled, files } = result;
    if (!canceled) {
      if (callback) {
        return callback(files);
      }
    }
  };

  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-file-dialog", {
      properties: ["openFile", "multiSelections"],
    }).then((result) => {
      handleDialogPromise(result);
    });
  }
}

export const displayFolderSelector = (callback, onCancelCallback) => {
  const handleDialogPromise = (result) => {
    const { canceled, filePaths } = result;
    if (!canceled) {
      if (callback) {
        return callback(filePaths[0]);
      }
    } else {
      if (onCancelCallback) {
        return onCancelCallback();
      }
    }
  };
  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-folder-dialog", {}).then((result) => {
      handleDialogPromise(result);
    });
  }
};

export const openPathInFileExplorer = (path) => {
  window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-path-in-file-explorer", {
    resourcePath: path,
  });
};

export const handleOpenLocalFileInBrowser = (link) => {
  window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
    link,
  });
};
const FileDialogButton = ({ text, callback }) => {
  return (
    <Button onClick={() => displayFileSelector(callback)} style={{ marginRight: 8 }}>
      {text || "Select File"}
    </Button>
  );
};

export default FileDialogButton;
