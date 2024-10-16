import React, { useState, useEffect, useCallback, useMemo } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentVariableValue, VariableType } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import "./variablesList.scss";

interface VariablesListProps {
  searchValue: string;
}

export type EnvironmentVariableTableRow = EnvironmentVariableValue & { key: string; id: number };

export const VariablesList: React.FC<VariablesListProps> = ({ searchValue }) => {
  const { getCurrentEnvironmentVariables, setVariables, removeVariable } = useEnvironmentManager();
  //   TODO: REMOVE THIS AFTER ADDING LOADING STATE IN VIEWER COMPONENT
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const handleSaveVariable = useCallback(
    (row: EnvironmentVariableTableRow) => {
      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];
      variableRows.splice(index, 1, { ...item, ...row });
      setDataSource(variableRows);

      if (row.key) {
        const variableToSave = {
          [row.key]: {
            type: row.type,
            syncValue: row.syncValue,
            localValue: row.localValue,
          },
        };
        setVariables(variableToSave);
      }
    },
    [dataSource, setVariables]
  );

  const handleAddNewRow = useCallback((dataSource: EnvironmentVariableTableRow[]) => {
    const newData = {
      id: dataSource.length + 1,
      key: "",
      type: VariableType.String,
      localValue: "",
      syncValue: "",
    };
    setDataSource([...dataSource, newData]);
  }, []);

  const handleDeleteVariable = useCallback(
    async (key: string) => {
      const newData = key ? dataSource.filter((item) => item.key !== key) : dataSource.slice(0, -1);

      if (key) {
        await removeVariable(key);
      }

      setDataSource(newData);

      if (newData.length === 0) {
        handleAddNewRow([]);
      }
    },
    [dataSource, removeVariable, handleAddNewRow]
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
          type: VariableType.String,
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
