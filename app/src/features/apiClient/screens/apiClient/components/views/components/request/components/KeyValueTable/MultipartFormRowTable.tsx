import React, { useContext } from "react";
import { Checkbox, Form, Select, FormInstance } from "antd";
import { Conditional } from "components/common/Conditional";
import InfoIcon from "components/misc/InfoIcon";
import { displayMultiFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { FormDropDownOptions, RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import FileDropdown from "./FileDropdown";
import * as Sentry from "@sentry/react";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { FileFeature, useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

export const MultiEditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof RQAPI.FormDataKeyValuePair;
  record: RQAPI.FormDataKeyValuePair;
  variables: ScopedVariables;
  handleUpdatePair: (record: RQAPI.FormDataKeyValuePair) => void;
  checkInvalidCharacter?: boolean;
}

export const MultiEditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  variables,
  handleUpdatePair,
  checkInvalidCharacter,
  ...restProps
}) => {
  const [addFile, removeFile] = useApiClientFileStore((state) => [state.addFile, state.removeFile]);
  const form = useContext(EditableContext);

  if (!form) {
    Sentry.captureException(new Error("EditableCell rendered outside Multi-Part Form table context"));
    return <td {...restProps}>{children}</td>;
  }

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleUpdatePair({ ...record, ...values });
    } catch (error) {
      Sentry.captureMessage("Error saving key-value pair", error);
    }
  };

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  const handleFileSelection = (files: { name: string; path: string; size: number }[], shouldAppend = false) => {
    const selectedFiles = files.map(({ name, path, size }) => {
      const fileId = name + "-" + Date.now();
      addFile(fileId, {
        name,
        path,
        size,
        source: "desktop",
        fileFeature: FileFeature.FILE_BODY,
      });

      return {
        id: fileId,
        name,
        path,
        size,
        source: "desktop",
      };
    });

    let updatedFiles;
    if (shouldAppend) {
      const existingFiles: any[] = Array.isArray(record.value) ? record.value : [];
      updatedFiles = [...existingFiles, ...selectedFiles];
    } else {
      updatedFiles = selectedFiles;
    }

    form.setFieldsValue({ [dataIndex]: updatedFiles });
    save();
  };

  const handleSelectFiles = () => {
    displayMultiFileSelector((files: { name: string; path: string; size: number }[]) =>
      handleFileSelection(files, false)
    );
  };

  const handleAddMoreFiles = () => {
    displayMultiFileSelector((files: { name: string; path: string; size: number }[]) =>
      handleFileSelection(files, true)
    );
  };

  const handleDeleteFile = (fileId: string) => {
    removeFile(fileId);
    const currentFiles: any[] = Array.isArray(record.value) ? record.value : [];
    const remainingFiles = currentFiles.filter((file) => file.id !== fileId);

    form.setFieldsValue({ [dataIndex]: remainingFiles });
    save();
  };

  return (
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {dataIndex === "isEnabled" ? (
          <Checkbox
            className="key-value-table-checkbox"
            checked={record?.isEnabled ?? true}
            onChange={(e) => {
              form.setFieldsValue({ [dataIndex]: e.target.checked });
              save();
            }}
          />
        ) : (
          <div
            className={`key-value-input-container ${
              INVALID_KEY_CHARACTERS.test(record.key) && dataIndex === "key" && checkInvalidCharacter
                ? "error-state"
                : ""
            }`}
          >
            {dataIndex === "value" && (
              <Select
                className="key-value-table-file-text-select"
                options={[
                  {
                    value: FormDropDownOptions.TEXT,
                    label: "Text",
                  },
                  {
                    value: FormDropDownOptions.FILE,
                    label: "File",
                  },
                ]}
                defaultValue={record?.type ?? FormDropDownOptions.TEXT}
                onChange={(value) => {
                  //clear the value if type is changed to file, because earlier value remains there
                  const newValue: string | [] = value === FormDropDownOptions.FILE ? [] : "";
                  form.setFieldsValue({ type: value, value: newValue });
                  handleUpdatePair({ ...record, type: value, value: newValue });
                }}
              />
            )}

            {(dataIndex === "key" || (dataIndex === "value" && record.type === FormDropDownOptions.TEXT)) && (
              <SingleLineEditor
                className={`key-value-table-input ${
                  record.isEnabled === false ? "key-value-table-input-disabled" : ""
                }`}
                placeholder={dataIndex === "key" ? "Key" : "Value"}
                defaultValue={record?.[dataIndex] as string}
                onChange={(value) => {
                  form.setFieldsValue({ [dataIndex]: value });
                  save();
                }}
                variables={variables}
              />
            )}

            <Conditional
              condition={
                INVALID_KEY_CHARACTERS.test(record?.key) && dataIndex === "key" && Boolean(checkInvalidCharacter)
              }
            >
              <div className="key-value-table-error-icon">
                <InfoIcon
                  text="Invalid character used in key"
                  tooltipPlacement="right"
                  showArrow={false}
                  style={{
                    color: "var(--requestly-color-error)",
                    marginTop: "2px",
                    width: "16px",
                    height: "16px",
                    fontFamily: "Material Symbols Outlined",
                  }}
                />
              </div>
            </Conditional>

            {dataIndex === "value" &&
              record?.type === FormDropDownOptions.FILE &&
              (!Array.isArray(record?.value) || record?.value?.length === 0) && (
                <RQButton
                  size="small"
                  type="secondary"
                  className="key-value-table-file-button"
                  onClick={handleSelectFiles}
                >
                  Select Files
                </RQButton>
              )}

            {dataIndex === "value" && record?.type === FormDropDownOptions.FILE && record?.value?.length > 0 && (
              <FileDropdown
                MultipartFormEntry={record}
                onAddMoreFiles={handleAddMoreFiles}
                onDeleteFile={handleDeleteFile}
              />
            )}
          </div>
        )}
      </Form.Item>
    </td>
  );
};
