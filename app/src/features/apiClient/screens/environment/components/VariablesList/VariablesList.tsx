import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { EnvironmentVariableValue, EnvironmentVariableType, EnvironmentVariables } from "backend/environment/types";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableCell, EditableRow } from "./components/customTableRow/CustomTableRow";
import { toast } from "utils/Toast";
import { EnvironmentAnalyticsContext, EnvironmentAnalyticsSource } from "../../types";
import { trackAddVariableClicked } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import "./variablesList.scss";

interface VariablesListProps {
  variables: EnvironmentVariables;
  searchValue?: string;
  onVariablesChange: (variables: EnvironmentVariables) => void;
}

export type EnvironmentVariableTableRow = EnvironmentVariableValue & { key: string; id: number };

export const VariablesList: React.FC<VariablesListProps> = ({ searchValue = "", variables, onVariablesChange }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [dataSource, setDataSource] = useState([]);
  const [visibleSecretsRowIds, setVisibleSecrets] = useState([]);

  const filteredDataSource = useMemo(
    () => dataSource.filter((item) => item.key.toLowerCase().includes(searchValue.toLowerCase())),
    [dataSource, searchValue]
  );

  const handleSaveVariable = useCallback(
    (row: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => {
      if (!user.loggedIn) {
        return;
      }

      const variableRows = [...dataSource];
      const index = variableRows.findIndex((variable) => row.id === variable.id);
      const item = variableRows[index];

      if ((row.key && (row.syncValue || row.localValue)) || fieldChanged === "type" || fieldChanged === "key") {
        const isDuplicate = variableRows.some(
          (variable, idx) => idx !== index && variable.key.toLowerCase() === row.key.toLowerCase()
        );

        if (isDuplicate && row.key) {
          toast.error(`Variable with name "${row.key}" already exists`);
          return;
        }

        const updatedRow = { ...item, ...row };
        variableRows.splice(index, 1, updatedRow);
        setDataSource(variableRows);

        const allVariables = variableRows.reduce((acc, variable) => {
          if (variable.key) {
            acc[variable.key] = {
              type: variable.type,
              syncValue: variable.syncValue,
              localValue: variable.localValue,
            };
          }
          return acc;
        }, {});

        onVariablesChange(allVariables);
      }
    },
    [dataSource, onVariablesChange, user.loggedIn]
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
      setDataSource(newData);

      const remainingVariables = newData.reduce((acc, variable) => {
        if (variable.key) {
          acc[variable.key] = {
            type: variable.type,
            syncValue: variable.syncValue,
            localValue: variable.localValue,
          };
        }
        return acc;
      }, {});

      onVariablesChange(remainingVariables);

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
