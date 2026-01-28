import { useState } from 'react';

export default function useRuntimeVariablesView() {
  const [searchValue, setSearchValue] = useState('');
  return {
    searchValue,
    setSearchValue
  };
}
