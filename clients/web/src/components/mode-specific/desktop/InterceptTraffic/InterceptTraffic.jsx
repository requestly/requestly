import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import ProCard from "@ant-design/pro-card";
import React, { useEffect, useMemo, useRef } from "react";
import WebTraffic from "./WebTraffic";
import "./InterceptTraffic.css";

const InterceptTraffic = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isNewUserUpdated = useRef(false);

  useEffect(() => {
    if (isNewUserUpdated.current) {
      return;
    }
    const isNewUser = searchParams.get("isNewUser") === "true";
    if (isNewUser) {
      dispatch(globalActions.updateIsNewUser(true));
      isNewUserUpdated.current = true;
    }
  }, [dispatch, searchParams]);

  return (
    <ProCard className="primary-card github-like-border web-traffic-pro-card">
      <WebTraffic />
    </ProCard>
  );
};

export default InterceptTraffic;
