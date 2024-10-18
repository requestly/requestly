import React, { useState, useEffect, useCallback, useMemo } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentVariableValue, EnvironmentVariableType } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import { toast } from "utils/Toast";
import "./variablesList.scss";

interface VariablesListProps {
  searchValue: string;
}

export type EnvironmentVariableTableRow = EnvironmentVariableValue & { key: string; id: number };

export const VariablesList: React.FC<VariablesListProps> = ({ searchValue }) => {
  const {
    getCurrentEnvironmentVariables,
    setVariables,
    removeVariable,
    getCurrentEnvironment,
  } = useEnvironmentManager();
  //   TODO: REMOVE THIS AFTER ADDING LOADING STATE IN VIEWER COMPONENT
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { currentEnvironmentId } = getCurrentEnvironment();

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const handleSaveVariable = useCallback(
    (row: EnvironmentVariableTableRow, isVariableTypeChanged: boolean = false) => {
      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];

      if (row.key || isVariableTypeChanged) {
        // Check if the new key already exists (excluding the current row)
        const isDuplicate = variableRows.some(
          (variable, idx) => idx !== index && variable.key.toLowerCase() === row.key.toLowerCase()
        );

        if (isDuplicate && row.key) {
          toast.error(`Variable with name "${row.key}" already exists`);
          console.error(`Variable with name "${row.key}" already exists`);
          return;
        }

        const updatedRow = { ...item, ...row };
        variableRows.splice(index, 1, updatedRow);

        if (isVariableTypeChanged) {
          // updating the dataSource state only when variable type is changed because state update makes the table inputs lose focus
          setDataSource(variableRows);
        }

        if (row.key) {
          const variablesToSave = variableRows.reduce((acc, variable) => {
            if (variable.key) {
              acc[variable.key] = {
                type: variable.type,
                syncValue: variable.syncValue,
                localValue: variable.localValue,
              };
            }
            return acc;
          }, {});
          setVariables(currentEnvironmentId, variablesToSave);
        }
      }
    },
    [dataSource, setVariables, currentEnvironmentId]
  );

  const handleAddNewRow = useCallback((dataSource: EnvironmentVariableTableRow[]) => {
    const newData = {
      id: dataSource.length + 1,
      key: "",
      type: EnvironmentVariableType.String,
      localValue: "",
      syncValue: "",
    };
    setDataSource([...dataSource, newData]);
  }, []);

  const handleDeleteVariable = useCallback(
    async (key: string) => {
      const newData = key ? dataSource.filter((item) => item.key !== key) : dataSource.slice(0, -1);

      if (key) {
        await removeVariable(currentEnvironmentId, key);
      }

      setDataSource(newData);

      if (newData.length === 0) {
        handleAddNewRow([]);
      }
    },
    [dataSource, removeVariable, handleAddNewRow, currentEnvironmentId]
  );

  const columns = useVariablesListColumns({ handleSaveVariable, handleDeleteVariable });

  useEffect(() => {
    if (!isTableLoaded) {
      setIsTableLoaded(true);
      const variables = getCurrentEnvironmentVariables();
      const formattedDataSource: EnvironmentVariableTableRow[] = Object.entries(variables).map(
        ([key, value], index) => ({
          id: index,
          key,
          type: value.type,
          localValue: value.localValue,
          syncValue: value.syncValue,
        })
      );
      if (formattedDataSource.length === 0) {
        formattedDataSource.push({
          id: 0,
          key: "",
          type: EnvironmentVariableType.String,
          localValue: "",
          syncValue: "",
        });
      }
      setDataSource(formattedDataSource);
    }
  }, [getCurrentEnvironmentVariables, isTableLoaded]);

  return (
    <ContentListTable
      id="variables-list"
      className="variables-list-table"
      bordered
      columns={columns}
      data={filteredDataSource}
      locale={{ emptyText: "No variables found" }}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
      scroll={{ y: "calc(100vh - 240px)" }}
      footer={() => (
        <div className="variables-list-footer">
          <RQButton icon={<MdAdd />} size="small" onClick={() => handleAddNewRow(dataSource)}>
            Add More
          </RQButton>
        </div>
      )}
    />
  );
};
