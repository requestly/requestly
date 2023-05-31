import { Button } from "antd";

export function displayFileSelector(callback) {
  const handleDialogPromise = (result) => {
    const { canceled, filePaths } = result;
    if (!canceled) {
      if (callback) {
        return callback(filePaths[0]);
      }
    }
  };

  if (window.RQ && window.RQ.DESKTOP && window.RQ.DESKTOP.SERVICES && window.RQ.DESKTOP.SERVICES.IPC) {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-file-dialog", {}).then((result) => {
      handleDialogPromise(result);
    });
  }
}

export const handleOpenLocalFileInBrowser = (link) => {
  console.log("!!!debug", "link", link);
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
