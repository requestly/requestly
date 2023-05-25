import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Space, Spin, Typography } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import "./index.css";

interface FilePickerProps {
  onFilesDrop: (files: File[]) => void;
  isProcessing: boolean;
  title: string;
  maxFiles?: number;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFilesDrop,
  isProcessing,
  title,
  maxFiles = 0, // no limitations
}) => {
  const [isFilePickerActive, setIsFilePickerActive] = useState<boolean>(false);

  const renderLoader = () => {
    return (
      <>
        <Spin size="large" />
        <Typography.Text className="title text-center">Processing...</Typography.Text>
      </>
    );
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesDrop(acceptedFiles);
    },
    [onFilesDrop]
  );

  const onDragEnter = useCallback(() => {
    setIsFilePickerActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsFilePickerActive(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    noClick: true,
    maxFiles: maxFiles,
  });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className={isFilePickerActive ? "file-picker-wrapper-active" : "file-picker-wrapper"}>
        {isProcessing ? (
          <>{renderLoader()}</>
        ) : (
          <>
            <CloudUploadOutlined className="file-picker-icon-lg" />

            <Space direction="vertical" align="center">
              <Typography.Text className="file-picker-icon-title">{title}</Typography.Text>
              <div>or</div>
            </Space>

            <Button onClick={open}>Browse</Button>
          </>
        )}
      </div>
    </div>
  );
};
