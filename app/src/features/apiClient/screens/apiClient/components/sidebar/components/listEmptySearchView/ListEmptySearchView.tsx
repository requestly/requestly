import React from "react";
import emptySearchSvg from "../../assets/empty-search.svg";
import "./listEmptySearchView.scss";

interface ListEmptySearchViewProps {
  message: string;
}

export const ListEmptySearchView: React.FC<ListEmptySearchViewProps> = ({ message }: ListEmptySearchViewProps) => {
  return (
    <div className="list-empty-search-view">
      <img src={emptySearchSvg} alt="empty search" />
      <div className="list-empty-search-view-message">{message}</div>
    </div>
  );
};
