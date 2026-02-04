import { useState } from "react";
import { useLocation } from "react-router-dom";

interface UseEnvironmentSwitcherProps {
  location: ReturnType<typeof useLocation>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useEnvironmentSwitcher = (): UseEnvironmentSwitcherProps => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return {
    location,
    isDropdownOpen,
    setIsDropdownOpen,
  };
};

export default useEnvironmentSwitcher;
