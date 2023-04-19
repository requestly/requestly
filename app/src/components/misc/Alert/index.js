import React from "react";

const Alert = ({ type, message, dismissible, onDismiss }) => {
  return (
    <div className={"alert fade show alert-" + type + (dismissible ? " alert-dismissible" : "")} role="alert">
      {message}
      {dismissible && (
        <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={onDismiss}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert;
