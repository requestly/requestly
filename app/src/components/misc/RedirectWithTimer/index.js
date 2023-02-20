import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
// CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
const { PATHS } = APP_CONSTANTS;

const RedirectWithTimer = ({ delay, path, message }) => {
  path = path ? path : PATHS.RULES.RELATIVE;
  // COMPONENT STATE
  const [timer, setTimer] = useState(delay);
  const [redirect, setRedirect] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (timer === delay) {
      // Getting intervalId to avoid memory leak error
      setIntervalId(setInterval(() => setTimer((timer) => timer - 1), 1000));
    }
    if (timer <= 0 && !redirect) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setRedirect(true);
    }
  }, [timer, redirect, delay, intervalId]);

  return redirect ? (
    <Navigate push to={path} />
  ) : (
    <h5 className="title is-6">
      {message ? message : `Redirecting you to ${path}`} in <span>{timer}</span>
    </h5>
  );
};

export default RedirectWithTimer;
