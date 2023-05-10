import React from "react";
// import { Row } from "antd";
import { RQModal } from "lib/design-system/components";
// import { useDropzone } from "react-dropzone";
import { FilePicker } from "components/common/FilePicker";

export const ImportFromCharlesModal: React.FC = () => {
  //   const [isDataProcessing, setIsDataProcessing] = useState(false);
  //   const FilePicker = () => {
  //     const [isDropZoneFocused, setIsDropZoneFocused] = useState(false);
  //     const onDrop = (acceptedFile: File[]) => {
  //       const file = acceptedFile[0];
  //       console.log({ file });
  //       const reader = new FileReader();

  //       // TODO: handle these cases
  //       // reader.onabort = () => toggleModal();
  //       // reader.onerror = () => toggleModal();

  //       reader.onload = () => {
  //         const fileContent = reader.result;
  //         console.log({ fileContent });
  //         setIsDataProcessing(true);
  //       };
  //       reader.readAsText(file);
  //     };

  //     const onDragEnter = () => {
  //       console.log("ENTER");
  //       setIsDropZoneFocused(true);
  //     };

  //     const onDragLeave = () => {
  //       console.log("Leave");
  //       setIsDropZoneFocused(false);
  //     };

  //     const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 1, onDragEnter, onDragLeave });

  //     return (
  //       <div {...getRootProps()}>
  //         <input {...getInputProps()} />
  //         <p>Drag 'n' drop some files here, or click to select files</p>
  //         {<>{isDropZoneFocused ? "FOCUS" : "BLUR"}</>}
  //       </div>
  //     );
  //   };
  const onFilesDrop = (files: File[]) => {
    console.log({ files });
  };

  return (
    <RQModal open={true} centered>
      <div className="rq-modal-content">
        <FilePicker title="Drop your Charles export file, or click to select" onFilesDrop={onFilesDrop} maxFiles={1} />
      </div>
    </RQModal>
  );
};
