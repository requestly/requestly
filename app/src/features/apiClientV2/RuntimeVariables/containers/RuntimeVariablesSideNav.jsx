import { SidebarItem } from '@browserstack/design-stack';
import React from 'react';
import useRuntimeVariableSidenav from '../hooks/useRuntimeVariableSidenav';
import { RUNTIME_VARIABLES_ENTITY_ID } from 'features/apiClient/slices/common/constants';
import { BrowserStackDSWrapper } from '../../common/DesignStackUtils';

function RuntimeVariablesSideNav() {
  const { handleTabOpen, activeTabSourceId } = useRuntimeVariableSidenav();
  return (
    <BrowserStackDSWrapper>
      <SidebarItem
        key={RUNTIME_VARIABLES_ENTITY_ID}
        nav={{
          id: RUNTIME_VARIABLES_ENTITY_ID,
          label: 'Runtime Variables New',
          path: '/runtime-variables-new'
        }}
        section="primary"
        currentId={activeTabSourceId}
        handleNavigationClick={handleTabOpen}
      />
    </BrowserStackDSWrapper>
  );
}

export default RuntimeVariablesSideNav;
