import { Typography } from "antd";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { InboxOutlined } from "@ant-design/icons";
import "./index.css";

interface FilePickerProps {
  onFilesDrop: (files: File[]) => void;
  title: string;
  maxFiles?: number;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFilesDrop,
  title,
  maxFiles = 0, // no limitations
}) => {
  const [isFilePickerActive, setIsFilePickerActive] = useState<boolean>(false);
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
        <InboxOutlined className="file-picker-icon-lg" />

        <Typography.Text className="file-picker-icon-title">{title}</Typography.Text>
      </div>
    </div>
  );
};
