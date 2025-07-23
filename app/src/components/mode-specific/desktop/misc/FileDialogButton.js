import { Button } from "antd";

export function displayFileSelector(callback) {
  const handleDialogPromise = (result) => {
    const { canceled, filePaths, files } = result;
    if (!canceled) {
      if (callback) {
        if (filePaths) {
          // for compatibility with how the UI expected open-file-dialog to respond earlier
          return callback(filePaths[0]);
        } else {
          return callback(files[0]?.path);
        }
      }
    }
  };

  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-file-dialog", {}).then((result) => {
      handleDialogPromise(result);
    });
  }
}

export function displayMultiFileSelector(callback, config = {}) {
  const handleDialogPromise = (result) => {
    const { canceled, files } = result;
    console.log("!!!debug", "result", result);
    if (!canceled) {
      if (callback) {
        return callback(files);
      }
    }
  };

  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-file-dialog", {
      properties: ["openFile", "multiSelections", "openDirectory"],
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
