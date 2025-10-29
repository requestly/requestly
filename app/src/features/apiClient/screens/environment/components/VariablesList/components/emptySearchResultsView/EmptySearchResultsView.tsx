import React from "react";
import { BiSearchAlt } from "@react-icons/all-files/bi/BiSearchAlt";
import { RQButton } from "lib/design-system-v2/components";
import "./emptySearchResultsView.scss";

interface EmptySearchResultsViewProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

const EmptySearchResultsView: React.FC<EmptySearchResultsViewProps> = ({ searchValue, onSearchValueChange }) => {
  if (searchValue === "") {
    return null;
  }
  return (
    <div className="variables-list-no-results-container">
      <div className="variables-list-no-results-icon">
        <BiSearchAlt size={48} />
      </div>
      <p>No variables found for "{searchValue}".</p>
      <p>Try clearing your search or adding variables.</p>
      <RQButton onClick={() => onSearchValueChange("")}>Clear search</RQButton>
    </div>
  );
};

export default EmptySearchResultsView;
