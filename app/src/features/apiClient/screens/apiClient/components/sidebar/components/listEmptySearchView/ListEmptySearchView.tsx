import React from "react";
import "./listEmptySearchView.scss";

interface ListEmptySearchViewProps {
  message: string;
}

export const ListEmptySearchView: React.FC<ListEmptySearchViewProps> = ({ message }: ListEmptySearchViewProps) => {
  return (
    <div className="list-empty-search-view">
      <img src={"/assets/media/apiClient/empty-search.svg"} alt="empty search" />
      <div className="list-empty-search-view-message">{message}</div>
    </div>
  );
};
