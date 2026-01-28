import { selectActiveTab, useTabActions } from 'componentsV2/Tabs/slice';
import { useWorkspaceId } from 'features/apiClient/common/WorkspaceProvider';
import { RUNTIME_VARIABLES_ENTITY_ID } from 'features/apiClient/slices/common/constants';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RuntimeVariablesViewTabSource } from '../utils/runtimeVariableTabSource';

export default function useRuntimeVariableSidenav() {
  const workspaceId = useWorkspaceId();
  const activeTab = useSelector(selectActiveTab);
  const { openBufferedTab } = useTabActions();

  const activeTabSourceId = useMemo(() => {
    if (activeTab) {
      return activeTab.source.getSourceId();
    }
  }, [activeTab]);

  const handleTabOpen = useCallback(() => {
    console.log('Opening Runtime Variables Tab');
    openBufferedTab({
      source: new RuntimeVariablesViewTabSource({
        id: RUNTIME_VARIABLES_ENTITY_ID,
        title: 'Runtime Variables',
        context: {
          id: workspaceId
        }
      })
    });
  }, [openBufferedTab, workspaceId]);

  useEffect(() => {
    handleTabOpen();
  }, [handleTabOpen]);

  return {
    handleTabOpen,
    activeTabSourceId
  };
}
