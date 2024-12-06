import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentVariableValue, EnvironmentVariableType } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import { toast } from "utils/Toast";
import { EnvironmentAnalyticsContext, EnvironmentAnalyticsSource } from "../../types";
import { trackAddVariableClicked, trackVariableValueUpdated } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import "./variablesList.scss";

interface VariablesListProps {
  searchValue: string;
  currentEnvironmentId: string;
}

export type EnvironmentVariableTableRow = EnvironmentVariableValue & { key: string; id: number };

export const VariablesList: React.FC<VariablesListProps> = ({ searchValue, currentEnvironmentId }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getEnvironmentVariables, setVariables, removeVariable } = useEnvironmentManager();
  const [dataSource, setDataSource] = useState([]);
  const variables = getEnvironmentVariables(currentEnvironmentId);
  const [visibleSecretsRowIds, setVisibleSecrets] = useState([]);

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const handleSaveVariable = useCallback(
    async (row: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => {
      if (!user.loggedIn) {
        return;
      }

      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];

      if ((row.key && row.syncValue) || fieldChanged === "type" || fieldChanged === "key") {
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

        if (fieldChanged === "type" || fieldChanged === "key") {
          // updating the dataSource state only when variable type or key is changed because state update makes the table inputs lose focus
          setDataSource(variableRows);
        }

        if (row.key && row.syncValue) {
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

          setVariables(currentEnvironmentId, variablesToSave).then(() => {
            setDataSource(variableRows);
            if (fieldChanged === "syncValue" || fieldChanged === "localValue") {
              trackVariableValueUpdated(fieldChanged, EnvironmentAnalyticsContext.API_CLIENT, variableRows.length);
            }
          });
        }
      }
    },
    [dataSource, setVariables, currentEnvironmentId, user.loggedIn]
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
    handleSaveVariable,
    handleDeleteVariable,
    visibleSecretsRowIds,
    updateVisibleSecretsRowIds: handleUpdateVisibleSecretsRowIds,
    recordsCount: dataSource.length,
  });

  useEffect(() => {
    if (variables) {
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
      footer={() => (
        <div className="variables-list-footer">
          <RQButton icon={<MdAdd />} size="small" onClick={handleAddVariable}>
            Add More
          </RQButton>
        </div>
      )}
    />
  );
};
