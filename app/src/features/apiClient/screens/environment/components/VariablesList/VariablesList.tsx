import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { EnvironmentVariableValue, EnvironmentVariableType } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import { EnvironmentAnalyticsContext, EnvironmentAnalyticsSource } from "../../types";
import { trackAddVariableClicked } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { useRBAC } from "features/rbac";
import "./variablesList.scss";

interface VariablesListProps {
  variables: EnvironmentVariableTableRow[];
  searchValue?: string;
  onVariablesChange: (variables: EnvironmentVariableTableRow[]) => void;
}

export type EnvironmentVariableTableRow = EnvironmentVariableValue & { key: string };

export const VariablesList: React.FC<VariablesListProps> = ({ searchValue = "", variables, onVariablesChange }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [dataSource, setDataSource] = useState([]);
  const [visibleSecretsRowIds, setVisibleSecrets] = useState([]);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "create");

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

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
    (row: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => {
      if (!user.loggedIn) {
        return;
      }

      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];

      if (row.key) {
        const updatedRow = { ...item, ...row };
        variableRows.splice(index, 1, updatedRow);
        setDataSource(variableRows);

        onVariablesChange(variableRows);
      }
    },
    [dataSource, onVariablesChange, user.loggedIn]
  );

  const handleAddNewRow = useCallback((dataSource: EnvironmentVariableTableRow[]) => {
    const newData = {
      id: dataSource.length,
      key: "",
      type: EnvironmentVariableType.String,
      localValue: "",
      syncValue: "",
    };
    setDataSource([...dataSource, newData]);
  }, []);

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

  const columns = useVariablesListColumns({
    handleVariableChange,
    handleDeleteVariable,
    visibleSecretsRowIds,
    updateVisibleSecretsRowIds: handleUpdateVisibleSecretsRowIds,
    recordsCount: dataSource.length,
    duplicateKeyIndices,
  });

  useEffect(() => {
    if (variables) {
      const formattedDataSource = [...variables].sort((a, b) => {
        return a.id - b.id; // Sort by id if both ids are defined
      });

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
  }, [variables]);

  const handleAddVariable = () => {
    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            eventSource: EnvironmentAnalyticsSource.VARIABLES_LIST,
            warningMessage: "Please log in to add a new variable",
          },
        })
      );
    } else {
      trackAddVariableClicked(EnvironmentAnalyticsContext.API_CLIENT, EnvironmentAnalyticsSource.VARIABLES_LIST);
      handleAddNewRow(dataSource);
    }
  };

  return (
    <ContentListTable
      id="variables-list"
      className="variables-list-table"
      bordered
      rowKey="id"
      columns={columns}
      data={filteredDataSource}
      locale={{ emptyText: "No variables found" }}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
      scroll={{ y: "calc(100vh - 280px)" }}
      footer={
        !isValidPermission
          ? null
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
