import { Spin, Typography } from "antd";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { InboxOutlined } from "@ant-design/icons";
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

  const onDrop = (acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles);
  };

  const onDragEnter = () => {
    setIsFilePickerActive(true);
  };

  const onDragLeave = () => {
    setIsFilePickerActive(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: maxFiles, onDragEnter, onDragLeave });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className={isFilePickerActive ? "file-picker-wrapper-active" : "file-picker-wrapper"}>
        {isProcessing ? (
          <>{renderLoader()}</>
        ) : (
          <>
            <InboxOutlined className="file-picker-icon-lg" />
            <Typography.Text className="file-picker-icon-title">{title}</Typography.Text>
          </>
        )}
      </div>
    </div>
  );
};
