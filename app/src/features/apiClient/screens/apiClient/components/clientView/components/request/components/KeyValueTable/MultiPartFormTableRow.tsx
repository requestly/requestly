import React, { useContext } from "react";
import { Checkbox, Form, Select, FormInstance } from "antd";
import { Conditional } from "components/common/Conditional";
import InfoIcon from "components/misc/InfoIcon";
import { displayMultiFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import { useApiClientFileStore } from "features/apiClient/hooks/useApiClientFileStore.hook";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { FormDropDownOptions, RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import DropdownFile from "./DropdownFileCard";
import { EnvironmentVariables } from "backend/environment/types";

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
  variables: EnvironmentVariables;
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
  const { addFile, removeFile, files } = useApiClientFileStore((state) => state);
  const form = useContext(EditableContext);

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleUpdatePair({ ...record, ...values });
    } catch (error) {
      console.error("Error saving key-value pair", error);
    }
  };
  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

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
                  record.type = value;
                  save();
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
              condition={INVALID_KEY_CHARACTERS.test(record?.key) && dataIndex === "key" && checkInvalidCharacter}
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

            {dataIndex === "value" && record?.type === FormDropDownOptions.FILE && Object.keys(files).length === 0 && (
              //using button instead of input tag, because support for electron desktop app
              // understand this in more depth why it happens
              <RQButton
                className="key-value-table-file-button"
                onClick={() => {
                  displayMultiFileSelector((selectedFilePaths: string[]) => {
                    console.log("Selected files:", selectedFilePaths);

                    (async () => {
                      const selectedFiles = await Promise.all(
                        selectedFilePaths.map(async (filePath) => {
                          const fileName = filePath.split("/").pop();
                          const fileId = fileName + "-" + Date.now();

                          const fileSize =
                            (await window.RQ?.DESKTOP?.SERVICES?.IPC?.invokeEventInMain?.("get-file-size", filePath)) ||
                            0;

                          return {
                            id: fileId,
                            name: fileName,
                            path: filePath,
                            source: "desktop",
                            size: fileSize,
                          };
                        })
                      );

                      // Add files to store with size information
                      selectedFiles.forEach((file) => {
                        addFile(file.id, {
                          name: file.name,
                          path: file.path,
                          size: file.size,
                          source: "desktop",
                          isFileValid: true,
                        });
                      });

                      console.log("Files", selectedFiles, files);
                      form.setFieldsValue({ [dataIndex]: selectedFiles });
                      save();
                    })();
                  });
                }}
              >
                Select Files
              </RQButton>
            )}

            {dataIndex === "value" && record?.type === FormDropDownOptions.FILE && Object.keys(files).length > 0 && (
              <DropdownFile
                onAddMoreFiles={() => {
                  displayMultiFileSelector((selectedFilePaths: string[]) => {
                    (async () => {
                      const newSelectedFiles = await Promise.all(
                        selectedFilePaths.map(async (filePath) => {
                          const fileName = filePath.split("/").pop();
                          const fileId = fileName + "-" + Date.now();

                          const fileSize =
                            (await window.RQ?.DESKTOP?.SERVICES?.IPC?.invokeEventInMain?.("get-file-size", filePath)) ||
                            0;

                          return {
                            id: fileId,
                            name: fileName,
                            path: filePath,
                            source: "desktop",
                            size: fileSize,
                          };
                        })
                      );

                      // Add files to store with size information
                      newSelectedFiles.forEach((file) => {
                        addFile(file.id, {
                          name: file.name,
                          path: file.path,
                          size: file.size,
                          source: "desktop",
                          isFileValid: true,
                        });
                      });

                      const existingFiles: any[] = Array.isArray(record.value) ? record.value : [];
                      const updatedFiles = [...existingFiles, ...newSelectedFiles];
                      form.setFieldsValue({ [dataIndex]: updatedFiles });
                      save();
                    })();
                  });
                }}
                onDeleteFile={(fileId: string) => {
                  removeFile(fileId);
                  const remainingFiles = Object.keys(files).map((id) => ({
                    id,
                    ...files[id],
                  }));
                  form.setFieldsValue({ [dataIndex]: remainingFiles });
                  save();
                }}
              />
            )}
          </div>
        )}
      </Form.Item>
    </td>
  );
};
