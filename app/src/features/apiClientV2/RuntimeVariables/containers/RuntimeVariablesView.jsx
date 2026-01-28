import React from 'react';
import RuntimeVariableHeader from '../components/RuntimeVariableHeader';
import RuntimeVariableList from '../components/RuntimeVariableList';
import { BrowserStackDSWrapper } from '../../common/DesignStackUtils';
import useRuntimeVariablesView from '../hooks/useRuntimeVariablesView';

function RuntimeVariablesView() {
  const { searchValue, setSearchValue } = useRuntimeVariablesView();
  return (
    <BrowserStackDSWrapper>
      <div className="p-4 gap-2 flex flex-col">
        <RuntimeVariableHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <RuntimeVariableList searchValue={searchValue} />
      </div>
    </BrowserStackDSWrapper>
  );
}

export default RuntimeVariablesView;
