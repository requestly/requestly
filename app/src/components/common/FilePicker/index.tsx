import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Space, Spin, Typography } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import "./index.css";

interface FilePickerProps {
  onFilesDrop: (files: File[]) => void;
  title: string;
  maxFiles?: number;
  isProcessing: boolean;
  loaderMessage?: string;
  subtitle?: string;
  selectorButtonTitle?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  title,
  onFilesDrop,
  isProcessing,
  maxFiles = 0, // no limitations
  loaderMessage = "Processing...",
  subtitle,
  selectorButtonTitle,
}) => {
  const [isFilePickerActive, setIsFilePickerActive] = useState<boolean>(false);

  const renderLoader = () => {
    return (
      <>
        <Spin size="large" />
        <Typography.Text className="title text-center">{loaderMessage}</Typography.Text>
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
    useFsAccessApi: false,
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
              <Typography.Text className="file-picker-icon-subtitle">{subtitle}</Typography.Text>
            </Space>

            <Button type="primary" size="middle" onClick={open}>
              {selectorButtonTitle ?? "Select file"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
