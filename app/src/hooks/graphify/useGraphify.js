// app/src/hooks/graphify/useGraphify.js

import { useState, useCallback } from "react";
import { graphifyService } from "backend/graphify";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const useGraphify = () => {
  // Track loading states and errors
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // Get current user's authentication status
  const user = useSelector(getUserAuthDetails);

  // Function to analyze a REST API
  const analyzeAPI = useCallback(
    async (baseUrl, authentication) => {
      if (!user?.loggedIn) {
        throw new Error("User must be logged in to analyze APIs");
      }

      setError(null);
      setIsAnalyzing(true);

      try {
        const result = await graphifyService.analyzeAPI(baseUrl, authentication);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [user]
  );

  // Function to execute a GraphQL query
  const executeQuery = useCallback(
    async (analysisId, query, variables = {}) => {
      if (!user?.loggedIn) {
        throw new Error("User must be logged in to execute queries");
      }

      setError(null);
      setIsExecuting(true);

      try {
        const result = await graphifyService.executeQuery(analysisId, query, variables);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [user]
  );

  // Return the functions and state
  return {
    analyzeAPI,
    executeQuery,
    isAnalyzing,
    isExecuting,
    error,
  };
};
