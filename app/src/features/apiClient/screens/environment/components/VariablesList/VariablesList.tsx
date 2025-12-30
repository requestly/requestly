import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { EnvironmentVariableType, EnvironmentVariables } from "backend/environment/types";
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
import { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";
import { mapToEnvironmentArray } from "../../utils";
import { debounce } from "lodash";

interface VariablesListProps {
  variablesData: EnvironmentVariables;
  variables: ApiClientVariables<any>;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  isReadOnly?: boolean;
  container: "environments" | "runtime";
}

export type VariableRow = VariableData & { key: string };

export const VariablesList: React.FC<VariablesListProps> = ({
  variablesData,
  variables,
  searchValue,
  onSearchValueChange,
  isReadOnly = false,
  container = "environments",
}) => {
  const [visibleSecretsRowIds, setVisibleSecrets] = useState<(number | string)[]>([]);

  const dataSource = useMemo(() => {
    const arr = mapToEnvironmentArray(variablesData);
    if (arr.length === 0) {
      return [
        {
          id: "__empty__",
          key: "",
          type: EnvironmentVariableType.String,
          syncValue: "",
          localValue: "",
          isPersisted: true,
        } as VariableRow,
      ];
    }
    return arr;
  }, [variablesData]);

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const hideFooter = isReadOnly || searchValue !== "";

  const duplicateKeyIndices = useMemo(() => {
    const keyIndices = new Map<string, number[]>();

    dataSource.forEach((row, index) => {
      if (row.key) {
        const lowercaseKey = row.key.toLowerCase();
        const indices = keyIndices.get(lowercaseKey) || [];
        indices.push(index);
        keyIndices.set(lowercaseKey, indices);
      }
    });

    const overridenIds = new Set<number | string>();

    keyIndices.forEach((indices) => {
      if (indices.length > 1) {
        indices.slice(0, -1).forEach((index) => {
          const row = dataSource[index];
          if (row) {
            overridenIds.add(row.id);
          }
        });
      }
    });

    return overridenIds;
  }, [dataSource]);

  const handleVariableChange = useCallback(
    (row: VariableRow, fieldChanged: keyof VariableRow) => {
      if (row.id === "__empty__") {
        if (row.key) {
          variables.add({
            key: row.key,
            type: row.type,
            syncValue: row.syncValue,
            localValue: row.localValue,
            isPersisted: true,
          });
        }
        return;
      }

      variables.set({ id: row.id, [fieldChanged]: row[fieldChanged] });
    },
    [variables]
  );

  const handleAddNewRow = useCallback(() => {
    trackAddVariableClicked(EnvironmentAnalyticsContext.API_CLIENT, EnvironmentAnalyticsSource.VARIABLES_LIST);
    variables.add({
      key: "",
      type: EnvironmentVariableType.String,
      syncValue: "",
      localValue: "",
      isPersisted: true,
    });
  }, [variables]);

  const handleDeleteVariable = useCallback(
    (id: number | string) => {
      if (id === "__empty__") {
        return;
      }
      variables.delete(id);
    },
    [variables]
  );

  const handleUpdateVisibleSecretsRowIds = useCallback(
    (id: number | string) => {
      if (visibleSecretsRowIds.includes(id)) {
        setVisibleSecrets(visibleSecretsRowIds.filter((secretRowId) => secretRowId !== id));
      } else {
        setVisibleSecrets([...visibleSecretsRowIds, id]);
      }
    },
    [visibleSecretsRowIds]
  );

  const handleUpdatePersisted = useCallback(
    (id: number | string, isPersisted: boolean) => {
      if (id === "__empty__") {
        return;
      }
      variables.set({ id, isPersisted: isPersisted as true });
    },
    [variables]
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
                <RQButton icon={<MdAdd />} size="small" onClick={handleAddNewRow}>
                  Add More
                </RQButton>
              </div>
            )
      }
    />
  );
};
