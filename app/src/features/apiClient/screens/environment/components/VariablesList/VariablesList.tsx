import React, { useState, useEffect, useCallback, useMemo } from "react";
import { EnvironmentVariableType } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import { EnvironmentAnalyticsContext, EnvironmentAnalyticsSource } from "../../types";
import { trackAddVariableClicked } from "../../analytics";
import "./variablesList.scss";
import { VariableData } from "features/apiClient/store/variables/types";
import EmptySearchResultsView from "./components/emptySearchResultsView/EmptySearchResultsView";

interface VariablesListProps {
  variables: VariableRow[];
  searchValue?: string;
  onVariablesChange: (variables: VariableRow[]) => void;
  isReadOnly?: boolean;
  container: "environments" | "runtime";
  onSearchValueChange?: (value: string) => void;
}

export type VariableRow = VariableData & { key: string };

const createNewVariable = (id: number, type: EnvironmentVariableType): VariableRow => ({
  id,
  key: "",
  type,
  syncValue: "",
  localValue: "",
  isPersisted: true,
});

export const VariablesList: React.FC<VariablesListProps> = ({
  searchValue = "",
  variables,
  onVariablesChange,
  isReadOnly = false,
  container = "environments",
  onSearchValueChange = () => {},
}) => {
  const [dataSource, setDataSource] = useState<VariableRow[]>([]);
  const [visibleSecretsRowIds, setVisibleSecrets] = useState<number[]>([]);

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const hideFooter = isReadOnly || searchValue !== "";

  const duplicateKeyIndices = useMemo(() => {
    const keyIndices = new Map<string, number[]>();

    // Collecting all indices for each key
    dataSource.forEach((row, index) => {
      if (row.key) {
        const lowercaseKey = row.key.toLowerCase();
        const indices = keyIndices.get(lowercaseKey) || [];
        indices.push(index);
        keyIndices.set(lowercaseKey, indices);
      }
    });

    // Create a set of indices (all except the last occurrence)
    const overridenIndices = new Set<number>();

    keyIndices.forEach((indices) => {
      if (indices.length > 1) {
        // Add all indices except the last one to the set
        indices.slice(0, -1).forEach((index) => {
          overridenIndices.add(dataSource[index].id);
        });
      }
    });

    return overridenIndices;
  }, [dataSource]);

  const handleVariableChange = useCallback(
    (row: VariableRow, fieldChanged: keyof VariableRow) => {
      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];

      if (row.key !== undefined && row.key !== null) {
        const updatedRow = { ...item, ...row };
        variableRows.splice(index, 1, updatedRow);
        setDataSource(variableRows);

        onVariablesChange(variableRows);
      }
    },
    [dataSource, onVariablesChange]
  );

  const handleAddNewRow = useCallback(
    (dataSource: VariableRow[]) => {
      const newVariable = createNewVariable(dataSource.length, EnvironmentVariableType.String);
      const newDataSource = [...dataSource, newVariable];
      setDataSource(newDataSource);
      if (container === "runtime") {
        onVariablesChange(newDataSource);
      }
    },
    [container, onVariablesChange]
  );

  const handleDeleteVariable = useCallback(
    async (id: number) => {
      if (isNaN(id)) {
        return;
      }
      const newData = dataSource.filter((item) => item.id !== id).map((record, index) => ({ ...record, id: index }));

      setDataSource(newData);

      onVariablesChange(newData);

      if (newData.length === 0) {
        handleAddNewRow([]);
      }
    },
    [dataSource, handleAddNewRow, onVariablesChange]
  );

  const handleUpdateVisibleSecretsRowIds = useCallback(
    (id: number) => {
      if (visibleSecretsRowIds.includes(id)) {
        setVisibleSecrets(visibleSecretsRowIds.filter((secretRowId) => secretRowId !== id));
      } else {
        setVisibleSecrets([...visibleSecretsRowIds, id]);
      }
    },
    [visibleSecretsRowIds]
  );

  const handleUpdatePersisted = useCallback(
    (id: number, isPersisted: boolean) => {
      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => variable.id === id);
      const item = variableRows[index];

      if (item) {
        const updatedRow = { ...item, isPersisted };
        variableRows.splice(index, 1, updatedRow);
        setDataSource(variableRows);

        onVariablesChange(variableRows);
      }
    },
    [dataSource, onVariablesChange]
  );

  const columns = useVariablesListColumns({
    handleVariableChange,
    handleDeleteVariable,
    handleUpdatePersisted,
    visibleSecretsRowIds,
    updateVisibleSecretsRowIds: handleUpdateVisibleSecretsRowIds,
    recordsCount: dataSource.length,
    duplicateKeyIndices,
    isReadOnly,
    container,
  });

  useEffect(() => {
    if (variables) {
      const formattedDataSource = [...variables].sort((a, b) => {
        return a.id - b.id; // Sort by id if both ids are defined
      });

      if (formattedDataSource.length === 0) {
        formattedDataSource.push(createNewVariable(0, EnvironmentVariableType.String));
      }
      setDataSource(formattedDataSource);
    }
  }, [variables, container]);

  const handleAddVariable = () => {
    trackAddVariableClicked(EnvironmentAnalyticsContext.API_CLIENT, EnvironmentAnalyticsSource.VARIABLES_LIST);
    handleAddNewRow(dataSource);
  };

  return (
    <ContentListTable
      id="variables-list"
      className="variables-list-table"
      bordered
      rowKey="id"
      columns={columns}
      data={filteredDataSource}
      locale={{
        emptyText: <EmptySearchResultsView searchValue={searchValue} onSearchValueChange={onSearchValueChange} />,
      }}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
      scroll={{ y: "calc(100vh - 280px)" }}
      footer={
        hideFooter
          ? undefined
          : () => (
              <div className="variables-list-footer">
                <RQButton icon={<MdAdd />} size="small" onClick={handleAddVariable}>
                  Add More
                </RQButton>
              </div>
            )
      }
    />
  );
};
